import * as tf from "@tensorflow/tfjs-node-gpu"
import { GaussianLikelihood } from "./gaussian-likelihood"
import { MlpSpecification, mlp } from "./mlp"

const LOG_STD_MIN = -20
const LOG_STD_MAX = 2

export class Actor extends tf.layers.Layer {
    private gaussianLikelihood: tf.layers.Layer

    private net: tf.Sequential
    private meanLayer: tf.layers.Layer
    private stdevLayer: tf.layers.Layer

    constructor(observationSize: number, actionSize: number, mlpSpec: MlpSpecification) {
        super()

        this.net = mlp({
            ...mlpSpec,
            sizes: [observationSize, ...mlpSpec.sizes],
        })

        this.net.predict

        this.meanLayer = tf.layers.dense({
            units: actionSize,
        })

        this.stdevLayer = tf.layers.dense({
            units: actionSize,
        })

        this.gaussianLikelihood = new GaussianLikelihood()
    }

    call(x: tf.Tensor<tf.Rank>): tf.Tensor<tf.Rank>[] {
        x = this.net.apply(x) as tf.Tensor<tf.Rank>
        const mu = this.meanLayer.apply(x) as tf.Tensor<tf.Rank>

        let logSigma = this.stdevLayer.apply(x) as tf.Tensor<tf.Rank>
        logSigma = tf.clipByValue(logSigma, LOG_STD_MIN, LOG_STD_MAX)
        const sigma = tf.exp(logSigma)

        let action = tf.mul(tf.randomNormal(mu.shape), sigma)
        action = tf.tanh(action)

        let logpPi = this.gaussianLikelihood.apply([action, mu, logSigma]) as tf.Tensor<tf.Rank>

        logpPi = tf.sub(
            logpPi,
            tf.sum(
                tf.mul(2, tf.sub(tf.sub(Math.log(2), action), tf.softplus(tf.mul(-2, action)))),
                1,
            ),
        )

        return [action, logpPi]
    }

    get trainableWeights(): tf.LayerVariable[] {
        return [
            ...this.net.trainableWeights,
            ...this.meanLayer.trainableWeights,
            ...this.stdevLayer.trainableWeights,
        ]
    }

    static get className() {
        return "Actor"
    }
}

tf.serialization.registerClass(Actor)
