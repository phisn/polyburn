import * as tf from "@tensorflow/tfjs"
import { Kwargs } from "@tensorflow/tfjs-layers/dist/types"
import { MlpSpecification, mlp } from "./mlp"

const LOG_STD_MIN = -20
const LOG_STD_MAX = 2

export function actor(observationSize: number, actionSize: number, mlpSpec: MlpSpecification) {
    const net = mlp({
        ...mlpSpec,
        sizes: [observationSize, ...mlpSpec.sizes],
    })

    const meanLayer = tf.layers.dense({
        inputDim: mlpSpec.sizes[mlpSpec.sizes.length - 1],
        units: actionSize,
        activation: "linear",
    })

    const stdevLayer = tf.layers.dense({
        inputDim: mlpSpec.sizes[mlpSpec.sizes.length - 1],
        units: actionSize,
        activation: "linear",
    })

    const innerActorLayer = new InnerActorLayer()

    const input = tf.input({ shape: [observationSize] })
    const netResult = net.apply(input) as tf.SymbolicTensor

    const mu = meanLayer.apply(netResult) as tf.SymbolicTensor
    const logstd = stdevLayer.apply(netResult) as tf.SymbolicTensor

    const [action, logprob] = innerActorLayer.apply([mu, logstd]) as tf.SymbolicTensor[]

    return tf.model({ inputs: [input], outputs: [action, logprob] })
}

class InnerActorLayer extends tf.layers.Layer {
    computeOutputShape(inputShape: tf.Shape[]): tf.Shape | tf.Shape[] {
        return [inputShape[0], inputShape[0]]
    }

    call([mu, logstd]: tf.Tensor<tf.Rank>[], kwargs: Kwargs): tf.Tensor<tf.Rank>[] {
        if (kwargs.deterministic && kwargs.noLogProb) {
            return [mu, tf.tensor([])]
        }

        const logstdClipped = tf.clipByValue(logstd, LOG_STD_MIN, LOG_STD_MAX)
        const sigma = tf.exp(logstdClipped)

        let action: tf.Tensor

        if (kwargs.deterministic) {
            action = mu
        } else {
            action = tf.add(
                mu,
                tf.mul(sigma, tf.randomNormal(mu.shape, 0, 1, "float32") as tf.Tensor<tf.Rank>),
            )
        }

        if (kwargs.noLogProb) {
            return [action, tf.tensor([])]
        }

        const actionLogProbCorrected = tf.sub(
            this.logProb(action, mu, sigma).sum(-1),
            tf.sum(
                tf.mul(2, tf.sub(Math.log(2), tf.add(action, tf.softplus(tf.mul(-2, action))))),
                1,
            ),
        )

        const tanhAction = tf.tanh(action)

        return [tanhAction, actionLogProbCorrected]
    }

    private logProb(x: tf.Tensor<tf.Rank>, mu: tf.Tensor<tf.Rank>, sigma: tf.Tensor<tf.Rank>) {
        const variance = tf.square(sigma)
        const logScale = tf.log(sigma)

        const s1 = tf.div(tf.square(tf.sub(x, mu)), tf.mul(2, variance))
        const s2 = logScale
        const s3 = Math.log(Math.sqrt(2 * Math.PI))

        return tf.neg(s1).sub(s2).sub(s3)
    }

    static get className() {
        return "InnerActorLayer"
    }
}
