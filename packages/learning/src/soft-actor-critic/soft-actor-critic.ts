import * as tf from "@tensorflow/tfjs"
import { Environment } from "../ppo/ppo"
import { actor } from "./actor"
import { critic } from "./critic"
import { MlpSpecification } from "./mlp"
import { Experience, ExperienceTensor, ReplayBuffer } from "./replay-buffer"

export interface Config {
    mlpSpec: MlpSpecification

    actionSize: number
    observationSize: number

    maxEpisodeLength: number
    bufferSize: number
    batchSize: number
    updateAfter: number
    updateEvery: number

    learningRate: number
    alpha: number
    gamma: number
    polyak: number

    deterministic?: boolean
}

export interface SacLearningInfo {
    episodeReturn: number
    episodeLength: number

    lastUpdateInfo: SacUpdateInfo
}

export interface SacUpdateInfo {
    lossQ: number
    lossPolicy: number
}

export interface SacLearningConfig {
    epochs: number
    stepsPerEpoch: number

    startAfter?: number // default 10 000
    renderEvery?: number // default 1

    onEpochFinish?: (progress: SacLearningInfo) => void

    // - guranteed to reset environment after call
    // can be used if you want to evalue the model after each episode manually
    // has the advantage of not breaking episodes in the middle
    onFirstEpisodeInEpoch?: (progress: SacLearningInfo) => void
}

export class SoftActorCritic {
    private replayBuffer: ReplayBuffer

    private policy: tf.LayersModel
    private policyOptimizer: tf.Optimizer

    private targetEntropy: number
    private logAlpha: tf.Variable<tf.Rank.R0>
    private logAlphaOptimizer: tf.Optimizer

    private q1: tf.LayersModel
    private q2: tf.LayersModel
    private targetQ1: tf.LayersModel
    private targetQ2: tf.LayersModel
    private qOptimizer: tf.Optimizer

    private deterministic: boolean
    private t: number

    constructor(private config: Config) {
        this.replayBuffer = new ReplayBuffer(config.bufferSize, config.batchSize)

        this.policy = actor(config.observationSize, config.actionSize, config.mlpSpec)
        this.q1 = critic(config.observationSize, config.actionSize, config.mlpSpec)
        this.q2 = critic(config.observationSize, config.actionSize, config.mlpSpec)

        this.targetQ1 = critic(config.observationSize, config.actionSize, config.mlpSpec)
        this.targetQ2 = critic(config.observationSize, config.actionSize, config.mlpSpec)

        this.deterministic = config.deterministic ?? false
        this.t = 0

        this.targetEntropy = -config.actionSize
        this.logAlpha = tf.variable(tf.scalar(Math.log(1)))

        this.policyOptimizer = tf.train.adam(config.learningRate)
        this.qOptimizer = tf.train.adam(config.learningRate)
        this.logAlphaOptimizer = tf.train.adam(config.learningRate)
    }

    async learn(env: Environment, learningConfig: SacLearningConfig) {
        const startAfter = learningConfig.startAfter ?? 1_000
        const renderEvery = learningConfig.renderEvery ?? 1

        let observation = env.reset()
        let episodeLength = 0
        let episodeReturn = 0

        let maxEpochEpisodeReturn = 0
        let maxEpochEpisodeLength = 0

        let hasEpisodeAlreadyEndedInEpoch = false
        let lastUpdateInfoInEpoch = { lossQ: 0, lossPolicy: 0 }

        const steps = learningConfig.epochs * learningConfig.stepsPerEpoch + this.t

        while (this.t < steps) {
            let action: number[]

            if (this.t > startAfter) {
                action = this.act(observation, false)
            } else {
                action = Array.from({ length: this.config.actionSize }, () => 2 * Math.random() - 1)
            }

            const [nextObservation, reward, done] = env.step(action)
            episodeLength += 1
            episodeReturn += reward

            maxEpochEpisodeLength = Math.max(maxEpochEpisodeLength, episodeLength)
            maxEpochEpisodeReturn = Math.max(maxEpochEpisodeReturn, episodeReturn)

            const updateInfo = this.observe({
                observation,
                action,
                reward,
                nextObservation,
                done: episodeLength === this.config.maxEpisodeLength ? false : done,
            })

            lastUpdateInfoInEpoch = updateInfo ?? lastUpdateInfoInEpoch
            observation = nextObservation

            if (done || episodeLength === this.config.maxEpisodeLength) {
                if (hasEpisodeAlreadyEndedInEpoch === false) {
                    if (learningConfig.onFirstEpisodeInEpoch) {
                        learningConfig.onFirstEpisodeInEpoch?.({
                            episodeReturn,
                            episodeLength,
                            lastUpdateInfo: lastUpdateInfoInEpoch,
                        })
                    }

                    hasEpisodeAlreadyEndedInEpoch = true
                }

                observation = env.reset()
                episodeLength = 0
            }

            if (this.t % learningConfig.stepsPerEpoch === 0) {
                console.log("Alpha: ", this.logAlpha.exp().arraySync())

                if (learningConfig.onEpochFinish) {
                    learningConfig.onEpochFinish({
                        episodeReturn: maxEpochEpisodeReturn,
                        episodeLength: maxEpochEpisodeLength,
                        lastUpdateInfo: lastUpdateInfoInEpoch,
                    })
                }

                maxEpochEpisodeReturn = 0
                maxEpochEpisodeLength = 0

                hasEpisodeAlreadyEndedInEpoch = false
            }

            if (renderEvery > 0 && this.t % renderEvery === 0) {
                await tf.nextFrame()
            }
        }
    }

    act(observation: number[], deterministic: boolean) {
        return tf.tidy(() => {
            const [action] = this.policy.apply(tf.tensor2d([observation]), {
                deterministic,
                noLogProb: true,
            }) as tf.Tensor<tf.Rank.R2>[]

            return action.squeeze([0]).arraySync() as number[]
        })
    }

    observe(experience: Experience): SacUpdateInfo | undefined {
        this.t += 1
        this.replayBuffer.store(experience)

        if (this.t > this.config.updateAfter && this.t % this.config.updateEvery === 0) {
            let averageLossQ = 0
            let averageLossPolicy = 0

            for (let i = 0; i < this.config.updateEvery; i++) {
                tf.tidy(() => {
                    const batch = this.replayBuffer.sample()
                    const updateInfo = this.update(batch)

                    averageLossQ += updateInfo.lossQ
                    averageLossPolicy += updateInfo.lossPolicy
                })
            }

            averageLossQ /= this.config.updateEvery
            averageLossPolicy /= this.config.updateEvery

            return {
                lossQ: averageLossQ,
                lossPolicy: averageLossPolicy,
            }
        }
    }

    predictQ1(observation: tf.Tensor2D, action: tf.Tensor2D) {
        return tf.squeeze(
            this.q1.apply(tf.concat([observation, action], 1)) as tf.Tensor<tf.Rank.R2>,
            [-1],
        ) as tf.Tensor<tf.Rank.R1>
    }

    predictQ2(observation: tf.Tensor2D, action: tf.Tensor2D) {
        return tf.squeeze(
            this.q2.apply(tf.concat([observation, action], 1)) as tf.Tensor<tf.Rank.R2>,
            [-1],
        ) as tf.Tensor<tf.Rank.R1>
    }

    update(batch: ExperienceTensor): SacUpdateInfo {
        const lossQ = () => {
            const q1 = this.predictQ1(batch.observation, batch.action)
            const q2 = this.predictQ2(batch.observation, batch.action)

            const backup = tf.tensor1d(this.computeBackup(batch).arraySync())

            const errorQ1 = tf.mean(tf.square(tf.sub(q1, backup))) as tf.Scalar
            const errorQ2 = tf.mean(tf.square(tf.sub(q2, backup))) as tf.Scalar

            return tf.add(errorQ1, errorQ2) as tf.Scalar
        }

        const { value: lossValueQ, grads: gradsQ } = tf.variableGrads(
            lossQ,
            this.q1.getWeights().concat(this.q2.getWeights()) as tf.Variable[],
        )

        this.qOptimizer.applyGradients(gradsQ)

        const lossPolicy = () => {
            const [pi, logpPi] = this.policy.apply(batch.observation, {
                deterministic: this.deterministic,
            }) as tf.Tensor<tf.Rank.R2>[]

            const piQ1 = this.predictQ1(batch.observation, pi)
            const piQ2 = this.predictQ2(batch.observation, pi)

            const minPiQ = tf.minimum(piQ1, piQ2)

            return logpPi.mul(this.logAlpha.exp()).sub(minPiQ).mean() as tf.Scalar
        }

        const { value: lossValuePolicy, grads: gradsPolicy } = tf.variableGrads(
            lossPolicy,
            this.policy.getWeights() as tf.Variable[],
        )

        this.policyOptimizer.applyGradients(gradsPolicy)

        const [, logpPi] = this.policy.apply(batch.observation, {
            deterministic: this.deterministic,
        }) as tf.Tensor<tf.Rank.R2>[]

        const alphaLoss = () => {
            return tf.neg(
                this.logAlpha.exp().mul(logpPi.add(this.targetEntropy)).mean(),
            ) as tf.Scalar
        }

        const { grads: gradsAlpha } = tf.variableGrads(alphaLoss, [this.logAlpha])
        this.logAlphaOptimizer.applyGradients(gradsAlpha)

        // do polyak averaging
        const tau = tf.scalar(this.config.polyak)
        const oneMinusTau = tf.scalar(1).sub(tau)

        const updateTargetQ1 = this.targetQ1
            .getWeights()
            .map((w, i) => w.mul(tau).add(this.q1.getWeights()[i].mul(oneMinusTau)))

        const updateTargetQ2 = this.targetQ2
            .getWeights()
            .map((w, i) => w.mul(tau).add(this.q2.getWeights()[i].mul(oneMinusTau)))

        this.targetQ1.setWeights(updateTargetQ1)
        this.targetQ2.setWeights(updateTargetQ2)

        return {
            lossQ: lossValueQ.arraySync(),
            lossPolicy: lossValuePolicy.arraySync(),
        }
    }

    private computeBackup(batch: ExperienceTensor) {
        const [action, logpPi] = this.policy.apply(batch.nextObservation, {
            deterministic: this.deterministic,
        }) as tf.Tensor<tf.Rank.R2>[]

        const targetQ1 = tf.squeeze(
            this.targetQ1.apply(tf.concat([batch.nextObservation, action], 1)) as tf.Tensor2D,
            [-1],
        ) as tf.Tensor<tf.Rank.R1>

        const targetQ2 = tf.squeeze(
            this.targetQ2.apply(tf.concat([batch.nextObservation, action], 1)) as tf.Tensor2D,
            [-1],
        ) as tf.Tensor<tf.Rank.R1>

        const softQTarget = tf.minimum(targetQ1, targetQ2).sub(logpPi.mul(this.logAlpha.exp()))

        const backup = batch.reward.add(
            softQTarget.mul(tf.scalar(1).sub(batch.done)).mul(this.config.gamma),
        ) as tf.Tensor<tf.Rank.R1>

        return backup
    }
}
