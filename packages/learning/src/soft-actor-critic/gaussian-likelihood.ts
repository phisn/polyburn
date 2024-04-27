import * as tf from "@tensorflow/tfjs-node-gpu"

export class GaussianLikelihood extends tf.layers.Layer {
    computeOutputShape(inputShape: tf.Shape[]): tf.Shape | tf.Shape[] {
        return [inputShape[0][0], 1]
    }

    call([x, mu, logstd]: tf.Tensor<tf.Rank>[]): tf.Tensor<tf.Rank> {
        const preSum = tf.mul(
            -0.5,
            tf.add(
                tf.pow(tf.div(tf.sub(x, mu), tf.exp(logstd)), 2),
                tf.add(tf.mul(2, logstd), Math.log(2 * Math.PI)),
            ),
        )

        return tf.sum(preSum, 1)
    }

    static get className() {
        return "GaussianLikelihood"
    }
}

tf.serialization.registerClass(GaussianLikelihood)
