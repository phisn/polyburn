import * as tf from "@tensorflow/tfjs-node-gpu"

class ReplayBuffer {
    private gamma: number
    private lambda: number

    private observationBuffer: number[][] = []
    private actionBuffer: (number | number[])[] = []
    private advantageBuffer: number[] = []
    private rewardBuffer: number[] = []
    private returnBuffer: number[] = []
    private criticPredictionBuffer: number[] = []
    private logProbabilityBuffer: number[] = []

    private trajectoryStartIndex: number = 0
    private ptr: number = 0

    constructor(gamma?: number, lambda?: number) {
        this.gamma = gamma ?? 0.99
        this.lambda = lambda ?? 0.95

        this.reset()
    }

    add(
        observation: number[],
        action: number | number[],
        reward: number,
        criticPrediction: number,
        logProbability: number,
    ) {
        this.observationBuffer.push(observation.slice(0))
        this.actionBuffer.push(action)
        this.rewardBuffer.push(reward)
        this.criticPredictionBuffer.push(criticPrediction)
        this.logProbabilityBuffer.push(logProbability)

        this.ptr++
    }

    discountedCumulativeSums(values: number[], coefficient: number) {
        const result = Array(values.length)
        let sum = 0

        for (let i = values.length - 1; i >= 0; i--) {
            sum = values[i] + sum * coefficient
            result[i] = sum
        }

        return result
    }

    finishTrajectory(lastValue: number) {
        const rewards = this.rewardBuffer.slice(this.trajectoryStartIndex, this.ptr)
        rewards.push(lastValue * this.gamma)

        const values = this.criticPredictionBuffer.slice(this.trajectoryStartIndex, this.ptr)
        values.push(lastValue)

        const deltas = rewards
            .slice(0, -1)
            .map((reward, ri) => reward - (values[ri] - this.gamma * values[ri + 1]))

        this.advantageBuffer.push(
            ...this.discountedCumulativeSums(deltas, this.gamma * this.lambda),
        )
        this.returnBuffer.push(...this.discountedCumulativeSums(rewards, this.gamma).slice(0, -1))

        this.trajectoryStartIndex = this.ptr
    }

    get() {
        const [advantageMean, advantageStd] = tf.tidy(() => [
            tf.mean(this.advantageBuffer).arraySync(),
            tf.moments(this.advantageBuffer).variance.sqrt().arraySync(),
        ])

        if (typeof advantageMean !== "number" || typeof advantageStd !== "number") {
            throw new Error("Invalid advantage mean or std")
        }

        this.advantageBuffer = this.advantageBuffer.map(
            advantage => (advantage - advantageMean) / advantageStd,
        )

        return {
            observationBuffer: this.observationBuffer,
            actionBuffer: this.actionBuffer,
            advantageBuffer: this.advantageBuffer,
            returnBuffer: this.returnBuffer,
            logProbabilityBuffer: this.logProbabilityBuffer,
        }
    }

    reset() {
        this.observationBuffer.length = 0
        this.actionBuffer.length = 0
        this.advantageBuffer.length = 0
        this.rewardBuffer.length = 0
        this.returnBuffer.length = 0
        this.criticPredictionBuffer.length = 0
        this.logProbabilityBuffer.length = 0

        this.trajectoryStartIndex = 0
        this.ptr = 0
    }
}

interface DiscreteSpace {
    class: "Discrete"
    len: number
}

interface BoxSpace {
    class: "Box"

    low: number
    high: number

    len: number
}

type Space = DiscreteSpace | BoxSpace

interface PPOConfig {
    gamma: number
    lambda: number

    steps: number
    epochs: number
    policyLearningRate: number
    valueLearningRate: number

    clipRatio: number
    targetKL: number

    actionSpace: Space
}

export interface Environment {
    reset(): number[]
    step(action: number | number[]): [number[], number, boolean]
}

export class PPO {
    private numTimeSteps: number
    private lastObservation: number[]

    private buffer: ReplayBuffer

    private actor: tf.LayersModel
    private critic: tf.LayersModel

    private optimizerPolicy: tf.Optimizer
    private optimizerValue: tf.Optimizer

    private logStd?: tf.Variable

    constructor(
        private config: PPOConfig,

        private env: Environment,

        actorModel: tf.LayersModel,
        criticModel: tf.LayersModel,
    ) {
        this.numTimeSteps = 0
        this.lastObservation = []

        this.buffer = new ReplayBuffer(config.gamma, config.lambda)

        this.actor = tf.sequential({
            layers: [
                actorModel,
                tf.layers.dense({
                    units: config.actionSpace.len,
                }),
            ],
        })

        this.critic = tf.sequential({
            layers: [
                criticModel,
                tf.layers.dense({
                    units: 1,
                    activation: "linear",
                }),
            ],
        })

        if (config.actionSpace.class === "Box") {
            this.logStd = tf.variable(tf.zeros([config.actionSpace.len]), true, "logStd")
        }

        this.optimizerPolicy = tf.train.adam(config.policyLearningRate)
        this.optimizerValue = tf.train.adam(config.valueLearningRate)
    }

    async save() {
        await this.actor.save("file://./training/actor")
        await this.critic.save("file://./training/critic")
    }

    async restore() {
        this.actor = await tf.loadLayersModel("file://./training/actor/model.json")
        this.critic = await tf.loadLayersModel("file://./training/critic/model.json")
    }

    act(observation: number[]): number | number[] {
        return tf.tidy(() => {
            const [, , actionSynced] = this.sampleAction(tf.tensor([observation]))
            return actionSynced
        })
    }

    learn(upToTimesteps: number) {
        while (this.numTimeSteps < upToTimesteps) {
            this.collectRollouts()
            this.train()
        }
    }

    private train() {
        const batch = this.buffer.get()

        tf.tidy(() => {
            const observationBuffer = tf.tensor2d(batch.observationBuffer)

            const actionBuffer = tf.tensor(
                batch.actionBuffer,
                undefined,
                this.config.actionSpace.class === "Discrete" ? "int32" : "float32",
            )

            const advantageBuffer = tf.tensor1d(batch.advantageBuffer)
            const returnBuffer = tf.tensor1d(batch.returnBuffer).reshape([-1, 1]) as tf.Tensor1D
            const logProbabilityBuffer = tf.tensor1d(batch.logProbabilityBuffer)

            for (let epoch = 0; epoch < this.config.epochs; ++epoch) {
                const kl = this.trainPolicy(
                    observationBuffer,
                    actionBuffer,
                    logProbabilityBuffer,
                    advantageBuffer,
                )

                if (kl > 1.5 * this.config.targetKL) {
                    break
                }
            }

            for (let epoch = 0; epoch < this.config.epochs; ++epoch) {
                this.trainValue(observationBuffer, returnBuffer)
            }
        })
    }

    private collectRollouts() {
        if (this.lastObservation.length === 0) {
            this.lastObservation = this.env.reset()
        }

        this.buffer.reset()

        for (let step = 0; step < this.config.steps; ++step) {
            tf.tidy(() => {
                const observation = tf.tensor([this.lastObservation]) as tf.Tensor2D

                const [predictions, action, actionClipped] = this.sampleAction(observation)
                const value = this.critic.predict(observation) as tf.Tensor2D
                const valueSynced = value.arraySync()[0][0]
                const actionSynced = action.arraySync()

                // TODO verify types
                const logProbability = this.logProb(predictions, action)
                const logProbabilitySynced = logProbability.arraySync()

                const [nextObservation, reward, done] = this.env.step(actionClipped)
                this.numTimeSteps++

                this.buffer.add(
                    this.lastObservation,
                    actionSynced,
                    reward,
                    valueSynced,
                    logProbabilitySynced,
                )

                this.lastObservation = nextObservation

                if (done || step === this.config.steps - 1) {
                    let lastValue = 0

                    if (!done) {
                        const lastValueTensor = this.critic.predict(
                            tf.tensor([nextObservation]),
                        ) as tf.Tensor2D

                        lastValue = lastValueTensor.arraySync()[0][0]
                    }

                    this.buffer.finishTrajectory(lastValue)
                    this.lastObservation = this.env.reset()
                }
            })
        }
    }

    private trainValue(observationBuffer: tf.Tensor2D, returnBuffer: tf.Tensor1D) {
        const optimize = () => {
            const valuesPredictions = this.critic.predict(observationBuffer) as tf.Tensor1D
            return tf.losses.meanSquaredError(returnBuffer, valuesPredictions) as tf.Scalar
        }

        tf.tidy(() => {
            const { grads } = this.optimizerValue.computeGradients(optimize)
            this.optimizerValue.applyGradients(grads)
        })
    }

    private trainPolicy(
        observationBuffer: tf.Tensor2D,
        actionBuffer: tf.Tensor,
        logProbabilityBuffer: tf.Tensor1D,
        advantageBuffer: tf.Tensor1D,
    ) {
        const optimize = () => {
            const predictions = this.actor.predict(observationBuffer) as tf.Tensor2D

            const logProbDiff = tf.sub(
                this.logProb(predictions, actionBuffer),
                logProbabilityBuffer,
            )

            const ratio = tf.exp(logProbDiff)

            const minAdvantage = tf.where(
                tf.greater(advantageBuffer, 0),
                tf.mul(tf.add(1, this.config.clipRatio), advantageBuffer),
                tf.mul(tf.sub(1, this.config.clipRatio), advantageBuffer),
            )

            const policyLoss = tf.neg(
                tf.mean(tf.minimum(tf.mul(ratio, advantageBuffer), minAdvantage)),
            )

            return policyLoss as tf.Scalar
        }

        return tf.tidy(() => {
            const { grads } = this.optimizerPolicy.computeGradients(optimize)
            this.optimizerPolicy.applyGradients(grads)

            const kl = tf.mean(
                tf.sub(
                    logProbabilityBuffer,
                    this.logProb(
                        this.actor.predict(observationBuffer) as tf.Tensor2D,
                        actionBuffer,
                    ),
                ),
            ) as tf.Scalar

            return kl.arraySync()
        })
    }

    private logProb(predictions: tf.Tensor2D, actions: tf.Tensor) {
        if (this.config.actionSpace.class === "Discrete") {
            return this.logProbCategorical(predictions, actions)
        } else if (this.config.actionSpace.class === "Box") {
            return this.logProbNormal(predictions, actions)
        } else {
            throw new Error("Unsupported action space")
        }
    }

    private logProbCategorical(predictions: tf.Tensor2D, actions: tf.Tensor) {
        return tf.tidy(() => {
            const numActions = predictions.shape[predictions.shape.length - 1]
            const logprobabilitiesAll = tf.logSoftmax(predictions)

            return tf.sum(
                tf.mul(tf.oneHot(actions, numActions), logprobabilitiesAll),
                logprobabilitiesAll.shape.length - 1,
            ) as tf.Scalar
        })
    }

    private logProbNormal(predictions: tf.Tensor2D, actions: tf.Tensor) {
        return tf.tidy(() => {
            if (this.logStd === undefined) {
                throw new Error("logStd is not initialized")
            }

            const scale = tf.exp(this.logStd)

            const logUnnormalized = tf.mul(
                -0.5,
                tf.square(tf.sub(tf.div(actions, scale), tf.div(predictions, scale))),
            )

            const logNormalization = tf.add(tf.scalar(0.5 * Math.log(2.0 * Math.PI)), tf.log(scale))

            return tf.sum(
                tf.sub(logUnnormalized, logNormalization),
                logUnnormalized.shape.length - 1,
            ) as tf.Scalar
        })
    }

    private sampleAction(observation: tf.Tensor2D) {
        return tf.tidy(() => {
            const predictions = tf.squeeze(
                this.actor.predict(observation) as tf.Tensor2D,
            ) as tf.Tensor2D

            const actionSpace = this.config.actionSpace

            if (actionSpace.class === "Discrete") {
                const action = tf.squeeze(tf.multinomial(predictions, 1)) as tf.Scalar
                const actionSynced = action.arraySync()

                return [predictions, action, actionSynced] as const
            } else if (actionSpace.class === "Box") {
                if (this.logStd === undefined) {
                    throw new Error("logStd is not initialized")
                }

                const action = tf.add(
                    tf.mul(tf.randomNormal([actionSpace.len]), tf.exp(this.logStd)),
                    predictions,
                ) as tf.Tensor1D

                const actionClipped = action.arraySync().map((x, i) => {
                    const low =
                        typeof actionSpace.low === "number" ? actionSpace.low : actionSpace.low[i]
                    const high =
                        typeof actionSpace.high === "number"
                            ? actionSpace.high
                            : actionSpace.high[i]

                    return Math.min(Math.max(x, low), high)
                })

                return [predictions, action, actionClipped] as const
            } else {
                throw new Error("Unsupported action space")
            }
        })
    }
}
