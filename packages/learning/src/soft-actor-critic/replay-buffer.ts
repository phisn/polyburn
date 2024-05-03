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
    private buffer: Experience[] = []
    private bufferIndex = 0

    constructor(
        private capacity: number,
        private batchSize: number,
        private observationSize: number,
        private actionSize: number,
    ) {
        if (batchSize > capacity) {
            throw new Error("Batch size must be less than or equal to capacity")
        }
    }

    push(experience: Experience) {
        if (this.buffer.length >= this.capacity) {
            this.buffer[this.bufferIndex] = experience
            this.bufferIndex = (this.bufferIndex + 1) % this.capacity
        } else {
            this.buffer.push({ ...experience })
        }
    }

    sample(): ExperienceTensor {
        if (this.buffer.length < this.batchSize) {
            throw new Error("Buffer does not have enough experiences")
        }

        const indices = [
            ...tf.util.createShuffledIndices(Math.min(this.buffer.length, this.batchSize)),
        ]

        const observation = tf.tensor2d(indices.map(x => this.buffer[x].observation))
        const action = tf.tensor2d(indices.map(x => this.buffer[x].action))
        const reward = tf.tensor1d(indices.map(x => this.buffer[x].reward))
        const nextObservation = tf.tensor2d(indices.map(x => this.buffer[x].nextObservation))
        const done = tf.tensor1d(indices.map(x => (this.buffer[x].done ? 1 : 0)))

        return { observation, action, reward, nextObservation, done }
    }
}
