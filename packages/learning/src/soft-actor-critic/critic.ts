import * as tf from "@tensorflow/tfjs"
import { MlpSpecification, mlp } from "./mlp"

export function critic(observationSize: number, actionSize: number, mlpSpec: MlpSpecification) {
    const q = mlp({
        ...mlpSpec,
        sizes: [observationSize + actionSize, ...mlpSpec.sizes, 1],
        outputActivation: "linear",
    })

    return q
}

class BeforeCriticLayer extends tf.layers.Layer {
    constructor() {
        super()
    }

    computeOutputShape(inputShape: tf.Shape | tf.Shape[]): tf.Shape | tf.Shape[] {
        console.log("inputShape: ", inputShape)
        return [inputShape[0][0], inputShape[0][1] + inputShape[1][1]]
    }

    call([obs, act]: tf.Tensor<tf.Rank>[]): tf.Tensor<tf.Rank> {
        console.log("obs: ", obs.dataSync())
        console.log("act: ", act.dataSync())

        const x = tf.concat([obs, act], -1)

        console.log("x: ", x.dataSync())

        return x
    }

    static get className() {
        return "BeforeCriticLayer"
    }
}

class AfterCriticLayer extends tf.layers.Layer {
    constructor() {
        super()
    }

    computeOutputShape(inputShape: tf.Shape | tf.Shape[]): tf.Shape | tf.Shape[] {
        console.log("inputShape: ", inputShape)
        return [inputShape[0]]
    }

    call(x: tf.Tensor<tf.Rank>): tf.Tensor<tf.Rank> {
        const y = tf.squeeze(x, [-1])

        return y
    }

    static get className() {
        return "AfterCriticLayer"
    }
}
