import * as tf from "@tensorflow/tfjs"
import { Actor } from "./actor"
import { Critic } from "./critic"
import { MlpSpecification } from "./mlp"
import { Experience, ReplayBuffer } from "./replay-buffer"

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
}

export class SoftActorCritic {
    private replayBuffer: ReplayBuffer

    private policy: Actor
    private policyOptimizer: tf.Optimizer

    private q1: Critic
    private q2: Critic
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
    }

    private update() {
        const batch = this.replayBuffer.sample()

        const loss = () => {}

        tf.variableGrads(loss)
    }
}
