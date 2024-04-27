import * as tf from "@tensorflow/tfjs-node-gpu"

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

    private tensorObservation: tf.TensorBuffer<tf.Rank.R2, "float32">
    private tensorAction: tf.TensorBuffer<tf.Rank.R2, "float32">
    private tensorReward: tf.TensorBuffer<tf.Rank.R1, "float32">
    private tensorNextObservation: tf.TensorBuffer<tf.Rank.R2, "float32">
    private tensorDone: tf.TensorBuffer<tf.Rank.R1, "bool">

    constructor(
        private capacity: number,
        private batchSize: number,
        private observationSize: number,
        private actionSize: number,
    ) {
        if (batchSize > capacity) {
            throw new Error("Batch size must be less than or equal to capacity")
        }

        this.tensorObservation = tf.buffer([batchSize, observationSize], "float32")
        this.tensorAction = tf.buffer([batchSize, actionSize], "float32")
        this.tensorReward = tf.buffer([batchSize], "float32")
        this.tensorNextObservation = tf.buffer([batchSize, observationSize], "float32")
        this.tensorDone = tf.buffer([batchSize], "bool")
    }

    push(experience: Experience) {
        if (this.buffer.length >= this.capacity) {
            this.buffer[this.bufferIndex] = experience
            this.bufferIndex = (this.bufferIndex + 1) % this.capacity
        } else {
            this.buffer.push(experience)
        }
    }

    sample(): ExperienceTensor {
        if (this.buffer.length < this.batchSize) {
            throw new Error("Buffer does not have enough experiences")
        }

        const indices = tf.util.createShuffledIndices(this.buffer.length)

        for (let i = 0; i < this.batchSize; i++) {
            const experience = this.buffer[indices[i]]

            for (let j = 0; j < this.observationSize; j++) {
                this.tensorObservation.set(experience.observation[j], i, j)
                this.tensorNextObservation.set(experience.nextObservation[j], i, j)
            }

            for (let j = 0; j < this.actionSize; j++) {
                this.tensorAction.set(experience.action[j], i, j)
            }

            this.tensorReward.set(experience.reward, i)
        }

        return {
            observation: this.tensorObservation.toTensor(),
            action: this.tensorAction.toTensor(),
            reward: this.tensorReward.toTensor(),
            nextObservation: this.tensorNextObservation.toTensor(),
            done: this.tensorDone.toTensor(),
        }
    }
}
