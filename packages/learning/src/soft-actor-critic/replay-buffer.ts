import * as tf from "@tensorflow/tfjs"

export interface Experience {
    observation: number[]
    action: number[]
    reward: number
    nextObservation: number[]
    done: boolean
}

export interface ExperienceTensor {
    observation: tf.Tensor<tf.Rank.R2>
    action: tf.Tensor<tf.Rank.R2>
    reward: tf.Tensor<tf.Rank.R1>
    nextObservation: tf.Tensor<tf.Rank.R2>
    done: tf.Tensor<tf.Rank.R1>
}

export class ReplayBuffer {
    private buffer: Experience[]
    private ptr: number
    private size: number

    private indices: number[]

    constructor(
        private capacity: number,
        private batchSize: number,
    ) {
        if (batchSize > capacity) {
            throw new Error("Batch size must be less than or equal to capacity")
        }

        this.buffer = []
        this.ptr = 0
        this.size = 0

        this.indices = []
    }

    store(experience: Experience) {
        if (this.size < this.capacity) {
            this.buffer.push({ ...experience })
            this.indices.push(this.size)
        } else {
            this.buffer[this.ptr] = experience
        }

        this.ptr = (this.ptr + 1) % this.capacity
        this.size = Math.min(this.size + 1, this.capacity)
    }

    sample(): ExperienceTensor {
        if (this.size < this.batchSize) {
            throw new Error("Buffer does not have enough experiences")
        }

        tf.util.shuffle(this.indices)
        const indices = this.indices.slice(0, this.batchSize)

        const observation = tf.tensor2d(
            indices.map(x => this.buffer[x].observation),
            undefined,
            "float32",
        )
        const action = tf.tensor2d(
            indices.map(x => this.buffer[x].action),
            undefined,
            "float32",
        )
        const reward = tf.tensor1d(
            indices.map(x => this.buffer[x].reward),
            "float32",
        )
        const nextObservation = tf.tensor2d(
            indices.map(x => this.buffer[x].nextObservation),
            undefined,
            "float32",
        )
        const done = tf.tensor1d(
            indices.map(x => (this.buffer[x].done ? 1 : 0)),
            "float32",
        )

        return { observation, action, reward, nextObservation, done }
    }
}
