import * as tf from "@tensorflow/tfjs"
import { Environment } from "../ppo/ppo"
import { ReplayBuffer } from "../soft-actor-critic/replay-buffer"

function qnetwork(observationDim: number, actionDim: number, hidden: number[]) {
    const sequence = tf.sequential()

    for (let i = 0; i < hidden.length; i++) {
        const input = i === 0 ? observationDim : hidden[i - 1]

        sequence.add(
            tf.layers.dense({
                inputShape: [input],
                units: hidden[i],
                activation: "relu",
            }),
        )
    }

    sequence.add(
        tf.layers.dense({
            inputShape: [hidden[hidden.length - 1]],
            units: actionDim,
            activation: "linear",
        }),
    )

    return sequence
}

interface DQNConfig {
    actionDim: number
    observationDim: number

    learningRate: number
    bufferSize: number
    gamma: number
    tau: number
    targetNetworkFrequency: number
    batchSize: number

    learningStartFrom: number
    trainingFrequency: number
}

interface DQNLearnConfig {
    epochs: number
    stepsPerEpoch: number

    startEpsilon: number
    endEpsilon: number
    explorationStepsFraction: number

    onTest?: () => void
}

export class DQN {
    private replayBuffer: ReplayBuffer

    private qnetwork: tf.LayersModel
    private targetQnetwork: tf.LayersModel
    private optimizer: tf.Optimizer

    constructor(
        private config: DQNConfig,
        private hidden: number[],
    ) {
        this.qnetwork = qnetwork(this.config.observationDim, this.config.actionDim, hidden)
        this.targetQnetwork = qnetwork(this.config.observationDim, this.config.actionDim, hidden)
        this.targetQnetwork.setWeights(this.qnetwork.getWeights())

        this.optimizer = tf.train.adam(this.config.learningRate)
        this.replayBuffer = new ReplayBuffer(this.config.bufferSize, this.config.batchSize)
    }

    act(observation: number[]) {
        const qvalues = tf.tidy(
            () => this.qnetwork.predict(tf.tensor2d([observation])) as tf.Tensor2D,
        )

        const action = tf.argMax(qvalues, 1).dataSync()[0]
        tf.dispose(qvalues)

        return action
    }

    async learn(env: Environment, learnConfig: DQNLearnConfig) {
        const steps = learnConfig.stepsPerEpoch * learnConfig.epochs
        const explorationSteps = steps * learnConfig.explorationStepsFraction

        let hasTrained = false

        let observation = env.reset()

        for (let step = 0; step < steps; step++) {
            const epsilonSlope =
                (learnConfig.endEpsilon - learnConfig.startEpsilon) / explorationSteps

            const epsilon = Math.max(
                learnConfig.endEpsilon,
                learnConfig.startEpsilon + epsilonSlope * step,
            )

            let action: number

            if (Math.random() < epsilon) {
                action = Math.floor(Math.random() * this.config.actionDim)
            } else {
                const qvalues = this.qnetwork.predict(tf.tensor2d([observation])) as tf.Tensor2D
                action = tf.argMax(qvalues, 1).dataSync()[0]
            }

            const [nextObservation, reward, done] = env.step(action)

            this.replayBuffer.store({
                observation,
                action: [action],
                reward,
                nextObservation,
                done,
            })

            if (done) {
                observation = env.reset()

                if (hasTrained) {
                    learnConfig.onTest?.()
                    hasTrained = false
                }
            } else {
                observation = nextObservation
            }

            if (step > this.config.learningStartFrom) {
                tf.tidy(() => {
                    if (step % this.config.trainingFrequency === 0) {
                        const batch = this.replayBuffer.sample()

                        const loss = () => {
                            const targetMax = tf.max(
                                this.targetQnetwork.predict(batch.nextObservation) as tf.Tensor2D,
                                -1,
                            )

                            const target = batch.reward
                                .flatten()
                                .add(
                                    targetMax
                                        .mul(this.config.gamma)
                                        .mul(tf.sub(1, batch.done.flatten())),
                                )

                            const targetNoGrad = tf.tensor1d(target.arraySync() as number[])

                            const previousValue = this.qnetwork.apply(
                                batch.observation,
                            ) as tf.Tensor2D

                            // we want to select from the previousValue tensor the values
                            // that correspond to the actions taken in the batch

                            // shape [128, 128, 1]
                            const actionValues = tf.gather(
                                previousValue,
                                batch.action.toInt(),
                                1,
                                1,
                            )

                            return tf.neg(
                                tf.losses.meanSquaredError(
                                    targetNoGrad,
                                    actionValues.squeeze(),
                                ) as tf.Scalar,
                            )
                        }

                        const { grads } = this.optimizer.computeGradients(
                            loss,
                            this.qnetwork.getWeights() as tf.Variable[],
                        )

                        this.optimizer.applyGradients(grads)
                    }

                    if (step % this.config.targetNetworkFrequency === 0) {
                        const weights = this.qnetwork.getWeights()
                        const targetWeights = this.targetQnetwork.getWeights()

                        const newTargetWeights = weights.map((weight, i) =>
                            targetWeights[i]
                                .mul(1 - this.config.tau)
                                .add(weight.mul(this.config.tau)),
                        )

                        this.targetQnetwork.setWeights(newTargetWeights)
                    }

                    hasTrained = true
                })
            }

            await tf.nextFrame()
        }
    }
}
