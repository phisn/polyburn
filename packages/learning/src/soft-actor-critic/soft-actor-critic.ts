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

    startAfter: number
    renderEvery: number

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

    private q1: tf.LayersModel
    private q2: tf.LayersModel
    private targetQ1: tf.LayersModel
    private targetQ2: tf.LayersModel
    private qOptimizer: tf.Optimizer

    private deterministic: boolean
    private episodeReturn: number
    private episodeLength: number

    private t: number

    constructor(private config: Config) {
        this.replayBuffer = new ReplayBuffer(config.bufferSize, config.batchSize)

        this.policy = actor(config.observationSize, config.actionSize, config.mlpSpec)
        this.q1 = critic(config.observationSize, config.actionSize, config.mlpSpec)
        this.q2 = critic(config.observationSize, config.actionSize, config.mlpSpec)

        this.targetQ1 = critic(config.observationSize, config.actionSize, config.mlpSpec)
        this.targetQ2 = critic(config.observationSize, config.actionSize, config.mlpSpec)

        this.deterministic = false
        this.episodeReturn = 0
        this.episodeLength = 0
        this.t = 0

        this.policyOptimizer = tf.train.adam(config.learningRate)
        this.qOptimizer = tf.train.adam(config.learningRate)
    }

    async learn(env: Environment, learningConfig: SacLearningConfig) {
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

            if (this.t > learningConfig.startAfter) {
                action = this.act(observation, false)
            } else {
                action = [Math.random() * 2 - 1]
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
                if (learningConfig.onEpochFinish) {
                    learningConfig.onEpochFinish({
                        episodeReturn: maxEpochEpisodeReturn,
                        episodeLength: maxEpochEpisodeLength,
                        lastUpdateInfo: lastUpdateInfoInEpoch,
                    })
                }

                maxEpochEpisodeReturn = 0
                maxEpochEpisodeLength = 0

                hasEpisodeAlreadyEndedInEpoch = true
            }

            if (learningConfig.renderEvery > 0 && this.t % learningConfig.renderEvery === 0) {
                await tf.nextFrame()
            }
        }
    }

    act(observation: number[], deterministic: boolean) {
        return tf.tidy(() => {
            const [action] = this.policy.apply(tf.tensor2d([observation]), {
                deterministic,
            }) as tf.Tensor<tf.Rank.R2>[]

            return action.squeeze([1]).arraySync() as number[]
        })
    }

    observe(experience: Experience): SacUpdateInfo | undefined {
        this.t += 1
        this.replayBuffer.store(experience)

        if (this.t > this.config.updateAfter && this.t % this.config.updateEvery === 0) {
            let averageLossQ = 0
            let averageLossPolicy = 0

            for (let i = 0; i < this.config.updateEvery; i++) {
                const batch = this.replayBuffer.sample()
                const updateInfo = this.update(batch)

                tf.dispose(batch.observation)
                tf.dispose(batch.action)
                tf.dispose(batch.reward)
                tf.dispose(batch.nextObservation)
                tf.dispose(batch.done)

                averageLossQ += updateInfo.lossQ
                averageLossPolicy += updateInfo.lossPolicy
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

            return tf.mean(logpPi.mul(this.config.alpha).sub(minPiQ)) as tf.Scalar
        }

        const { value: lossValuePolicy, grads: gradsPolicy } = tf.variableGrads(
            lossPolicy,
            this.policy.getWeights() as tf.Variable[],
        )

        this.policyOptimizer.applyGradients(gradsPolicy)

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

        const minTargetQ = tf.minimum(targetQ1, targetQ2)
        const softQTarget = tf.sub(minTargetQ, tf.mul(this.config.alpha, logpPi))

        const backup = tf.add(
            batch.reward,
            tf.mul(this.config.gamma, tf.mul(tf.scalar(1).sub(batch.done), softQTarget)),
        ) as tf.Tensor<tf.Rank.R1>

        return backup
    }
}
