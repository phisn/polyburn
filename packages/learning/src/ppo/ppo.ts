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
    n: number
}

interface BoxSpace {
    class: "Box"
    dtype?: "float32"
    shape: number[]
    low: number[]
    high: number[]
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

    observationSpace: Space
    actionSpace: Space
}

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
                        units: config.actionSpace.n,
                    }),
                ],
            })
        } else if (config.actionSpace.class === "Box") {
            this.actor = tf.sequential({
                layers: [
                    actorModel,
                    tf.layers.dense({
                        units: config.actionSpace.shape[0],
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
            this.logStd = tf.variable(tf.zeros([config.actionSpace.shape[0]]), true, "logStd")
        }

        this.optimizerPolicy = tf.train.adam(config.policyLearningRate)
        this.optimizerValue = tf.train.adam(config.valueLearningRate)
    }

    act(observation: number[]) {}

    private sampleAction(observation: tf.Tensor2D): [tf.Tensor2D, tf.Tensor2D] {}
}
