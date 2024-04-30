import * as tf from "@tensorflow/tfjs"

class ReplayBuffer {
    private gamma: number
    private lambda: number

    private observationBuffer: number[][] = []
    private actionBuffer: number[][] = []
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
        action: number[],
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

        return [
            this.observationBuffer,
            this.actionBuffer,
            this.advantageBuffer,
            this.returnBuffer,
            this.logProbabilityBuffer,
        ]
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
    dtype?: "int32"

    len: number
}

interface BoxSpace {
    class: "Box"
    dtype?: "float32"

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

    observationDimension: number
    actionSpace: Space
}

interface Environment {
    reset(): number[]
    step(action: number | number[]): [number[], number, boolean]
}

const ppo = new PPO(
    {} as PPOConfig,
    {} as Space,
    [
        {
            class: "Box",
            len: 2,
            low: [0, 0],
            high: [1, 1],
        },
        {
            class: "Discrete",
            len: 2,
        },
    ],
    {} as tf.LayersModel,
    {} as tf.LayersModel,
)

ppo.act([1, 2, 3])

class PPO {
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

        private actorModel: tf.LayersModel,
        private criticModel: tf.LayersModel,
    ) {
        this.numTimeSteps = 0
        this.lastObservation = []

        this.buffer = new ReplayBuffer(config.gamma, config.lambda)

        if (config.actionSpace.class === "Discrete") {
            this.actor = tf.sequential({
                layers: [
                    actorModel,
                    tf.layers.dense({
                        units: config.actionSpace.len,
                    }),
                ],
            })
        } else if (config.actionSpace.class === "Box") {
            this.actor = tf.sequential({
                layers: [
                    actorModel,
                    tf.layers.dense({
                        units: config.actionSpace.len,
                    }),
                ],
            })
        } else {
            throw new Error("Unsupported action space")
        }

        this.critic = tf.sequential({
            layers: [
                actorModel,
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

    act(observation: number[]): GetPPOSpaceType<ActionSpaces, "actionType"> {}

    private collectRollouts() {
        this.buffer.reset()

        let sumReturn = 0
        let sumReward = 0
        let numEpisodes = 0

        for (let step = 0; step < this.config.steps; ++step) {
            tf.tidy(() => {
                const observation = tf.tensor2d(this.lastObservation)

                const [predictions, action, actionSynced] = this.sampleAction(observation)
                const value = this.critic.predict(observation) as tf.Tensor1D

                // TODO verify types
                const logProbability = this.logProb(predictions as any, action as any)

                const [nextObservation, reward, done] = this.env.step(actionSynced)

                sumReturn += reward
                sumReward += reward
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
        actionBuffer: tf.Tensor2D,
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
            )

            return kl.arraySync()
        })
    }

    private logProb(predictions: tf.Tensor2D, actions: tf.Tensor2D) {
        if (this.config.actionSpace.class === "Discrete") {
            return this.logProbCategorical(predictions, actions)
        } else if (this.config.actionSpace.class === "Box") {
            return this.logProbNormal(predictions, actions)
        } else {
            throw new Error("Unsupported action space")
        }
    }

    private logProbCategorical(predictions: tf.Tensor2D, actions: tf.Tensor2D) {
        return tf.tidy(() => {
            const numActions = predictions.shape[predictions.shape.length - 1]
            const logprobabilitiesAll = tf.logSoftmax(predictions)

            return tf.sum(
                tf.mul(tf.oneHot(actions, numActions), logprobabilitiesAll),
                logprobabilitiesAll.shape.length - 1,
            )
        })
    }

    private logProbNormal(predictions: tf.Tensor2D, actions: tf.Tensor2D) {
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
            )
        })
    }

    private sampleAction(observation: tf.Tensor2D) {
        return tf.tidy(() => {
            const predictions = tf.squeeze(
                this.actor.predict(observation) as tf.Tensor2D,
            ) as tf.Tensor1D

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
