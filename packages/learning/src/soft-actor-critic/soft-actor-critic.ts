import * as tf from "@tensorflow/tfjs-node-gpu"
import { Actor } from "./actor"
import { Critic } from "./critic"
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

export class SoftActorCritic {
    private replayBuffer: ReplayBuffer

    private policy: Actor
    private policyOptimizer: tf.Optimizer

    private q1: Critic
    private q2: Critic
    private targetQ1: Critic
    private targetQ2: Critic
    private qOptimizer: tf.Optimizer

    private episodeReturn: number
    private episodeLength: number

    private t: number

    private actTensor: tf.TensorBuffer<tf.Rank.R2, "float32">

    constructor(private config: Config) {
        this.replayBuffer = new ReplayBuffer(
            config.bufferSize,
            config.batchSize,
            config.observationSize,
            config.actionSize,
        )

        this.policy = new Actor(config.observationSize, config.actionSize, config.mlpSpec)
        this.q1 = new Critic(config.observationSize, config.actionSize, config.mlpSpec)
        this.q2 = new Critic(config.observationSize, config.actionSize, config.mlpSpec)
        this.targetQ1 = new Critic(config.observationSize, config.actionSize, config.mlpSpec)
        this.targetQ2 = new Critic(config.observationSize, config.actionSize, config.mlpSpec)

        this.episodeReturn = 0
        this.episodeLength = 0
        this.t = 0

        this.actTensor = tf.buffer([1, config.observationSize], "float32")

        this.policyOptimizer = tf.train.adam(config.learningRate)
        this.qOptimizer = tf.train.adam(config.learningRate)
    }

    act(observation: number[]) {
        for (let i = 0; i < this.config.observationSize; i++) {
            this.actTensor.set(observation[i], 0, i)
        }

        return tf.tidy(() => {
            const [action] = this.policy.apply(this.actTensor.toTensor(), {
                training: false,
            }) as tf.Tensor<tf.Rank.R2>[]

            return action
        })
    }

    observe(experience: Experience) {
        this.episodeReturn += experience.reward
        this.episodeLength += 1
        this.t += 1

        const done = this.episodeLength < this.config.maxEpisodeLength && experience.done

        this.replayBuffer.push({
            ...experience,
            done,
        })

        if (done || this.episodeLength === this.config.maxEpisodeLength) {
            this.episodeReturn = 0
            this.episodeLength = 0
        }

        if (this.t > this.config.updateAfter && this.t % this.config.updateEvery === 0) {
            for (let i = 0; i < this.config.updateEvery; i++) {
                this.update()
            }
        }

        console.log(this.t)
    }

    private update() {
        tf.tidy(() => {
            const batch = this.replayBuffer.sample()
            const backup = this.computeBackup(batch)

            const lossQ = () => {
                const errorQ1 = tf.losses.meanSquaredError(
                    backup,
                    this.q1.apply([batch.observation, batch.action], {
                        training: true,
                    }) as tf.Tensor<tf.Rank.R1>,
                )

                const errorQ2 = tf.losses.meanSquaredError(
                    backup,
                    this.q2.apply([batch.observation, batch.action], {
                        training: true,
                    }) as tf.Tensor<tf.Rank.R1>,
                )

                return tf.add(errorQ1, errorQ2) as tf.Scalar
            }

            const gradsQ = tf.variableGrads(lossQ)
            this.qOptimizer.applyGradients(gradsQ.grads)

            const lossPolicy = () => {
                const [pi, logpPi] = this.policy.apply(batch.observation, {
                    training: true,
                }) as tf.Tensor<tf.Rank.R2>[]

                const piQ1 = this.q1.apply([batch.observation, pi], {
                    training: false,
                }) as tf.Tensor<tf.Rank.R1>
                const piQ2 = this.q2.apply([batch.observation, pi], {
                    training: false,
                }) as tf.Tensor<tf.Rank.R1>

                const minPiQ = tf.minimum(piQ1, piQ2)

                return tf.mean(tf.sub(tf.mul(this.config.alpha, logpPi), minPiQ)) as tf.Scalar
            }

            const gradsPolicy = tf.variableGrads(lossPolicy)
            this.policyOptimizer.applyGradients(gradsPolicy.grads)

            for (let i = 0; i < this.q1.trainableWeights.length; ++i) {
                const targetQ1 = this.targetQ1.trainableWeights[i]
                const q1 = this.q1.trainableWeights[i]

                targetQ1.write(
                    tf.add(
                        tf.mul(this.config.polyak, targetQ1.read()),
                        tf.mul(1 - this.config.polyak, q1.read()),
                    ),
                )

                const targetQ2 = this.targetQ2.trainableWeights[i]
                const q2 = this.q2.trainableWeights[i]

                targetQ2.write(
                    tf.add(
                        tf.mul(this.config.polyak, targetQ2.read()),
                        tf.mul(1 - this.config.polyak, q2.read()),
                    ),
                )
            }
        })
    }

    private computeBackup(batch: ExperienceTensor) {
        const [action, logpPi] = this.policy.apply(batch.nextObservation) as tf.Tensor<tf.Rank.R2>[]

        const targetQ1 = this.targetQ1.apply([
            batch.nextObservation,
            action,
        ]) as tf.Tensor<tf.Rank.R1>

        const targetQ2 = this.targetQ2.apply([
            batch.nextObservation,
            action,
        ]) as tf.Tensor<tf.Rank.R1>

        const minTargetQ = tf.minimum(targetQ1, targetQ2)
        const softQTarget = tf.sub(minTargetQ, tf.mul(this.config.alpha, logpPi))

        const backup = tf.add(
            batch.reward,
            tf.mul(this.config.gamma, tf.mul(tf.scalar(1).sub(batch.done), softQTarget)),
        ) as tf.Tensor<tf.Rank.R1>

        return backup
    }
}
