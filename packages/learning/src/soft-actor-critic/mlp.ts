import * as tf from "@tensorflow/tfjs"
import { ActivationIdentifier } from "@tensorflow/tfjs-layers/dist/keras_format/activation_config"

export interface MlpSpecification {
    sizes: number[]
    activation: ActivationIdentifier | undefined
    outputActivation: ActivationIdentifier | undefined
}

export function mlp(spec: MlpSpecification) {
    const model = tf.sequential()

    for (let i = 0; i < spec.sizes.length - 1; i++) {
        const nextActivation = i === spec.sizes.length - 2 ? spec.outputActivation : spec.activation

        model.add(
            tf.layers.dense({
                inputDim: spec.sizes[i],
                units: spec.sizes[i + 1],
                activation: nextActivation,
            }),
        )

        console.log(`Added layer with inputDim: ${spec.sizes[i]} and units: ${spec.sizes[i + 1]}`)
    }

    return model
}
