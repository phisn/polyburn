import * as tf from "@tensorflow/tfjs-node-gpu"
import { MlpSpecification, mlp } from "./mlp"

export class Critic extends tf.layers.Layer {
    private q: tf.Sequential

    constructor(observationSize: number, actionSize: number, mlpSpec: MlpSpecification) {
        super()

        this.q = mlp({
            ...mlpSpec,
            sizes: [observationSize + actionSize, ...mlpSpec.sizes, 1],
            outputActivation: undefined,
        })
    }

    call([obs, act]: tf.Tensor<tf.Rank>[]): tf.Tensor<tf.Rank> {
        let x = tf.concat([obs, act], 1)
        x = this.q.apply(x) as tf.Tensor<tf.Rank>
        return tf.squeeze(x, [1])
    }

    get trainableWeights(): tf.LayerVariable[] {
        return this.q.trainableWeights
    }

    static get className() {
        return "Critic"
    }
}

tf.serialization.registerClass(Critic)
