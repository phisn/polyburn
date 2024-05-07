import * as tf from "@tensorflow/tfjs-node"
import { GameEnvironment } from "learning-gym/src/main"
import { WorldModel } from "runtime/proto/world"
import { DefaultGameReward } from "web-game/src/game/reward/default-reward"
import { Environment, PPO } from "./ppo/ppo"

class SplitLayer extends tf.layers.Layer {
    computeOutputShape(inputShape: tf.Shape[]): tf.Shape[] {
        return [inputShape[0], inputShape[0]]
    }

    constructor(private left: number) {
        super()
    }

    call(inputs: tf.Tensor): tf.Tensor[] {
        console.error("inputs shape: ", inputs.shape)

        const len = inputs.shape[1]

        if (len === undefined) {
            throw new Error("Input is too short")
        }

        console.log("inputs shape: ", inputs.shape)

        return tf.split(inputs, [this.left, len - this.left], 1)
    }

    static get className() {
        return "SplitLayer"
    }
}

const worldStr2 =
    "ClwKBkdsb2JhbBJSEigNzcxUwBXJdsBBJQAA7MEtAADKQTUAAO5BPQAAmMBFAAAAQE0AAABAGiYKJAAANEEAAEA/AAD/AODPAACAgP8AAABAxMDA/wDgTwC0////AAo1CgJGMRIvEi0NMzMbQBWLbFdAHdsPyUAlAADswS0AALhANQAA7kE9AACYwEUAAABATQAAAEAKEgoCRzESDAoKDWZmDsEVZmbEQQoSCgJHMhIMCgoNZmYKwRVmZsJBChIKAkczEgwKCg1mZma/FWZmwkEKEgoCRzQSDAoKDWZmRkAVZmbEQQo1CgJGMhIvEi0NzcwywRWLbFdAHdsPyUAlAACawS0AAMpBNQAAIEE9AACYwEUAAABATQAAAEASHAoITm9ybWFsIDESEAoCRzEKAkYxCgZHbG9iYWwSHAoITm9ybWFsIDISEAoCRzIKAkYxCgZHbG9iYWwSHAoITm9ybWFsIDMSEAoCRzMKAkYxCgZHbG9iYWwSHAoITm9ybWFsIDQSEAoCRzQKAkYxCgZHbG9iYWwSHAoITm9ybWFsIDUSEAoCRjIKAkcxCgZHbG9iYWwSHAoITm9ybWFsIDYSEAoCRjIKAkcyCgZHbG9iYWwSHAoITm9ybWFsIDcSEAoCRjIKAkczCgZHbG9iYWwSHAoITm9ybWFsIDgSEAoCRzQKAkYyCgZHbG9iYWw="

const world = WorldModel.decode(Buffer.from(worldStr2, "base64"))

const env = new GameEnvironment(
    world,
    "Normal 1",
    {
        stepsPerFrame: 4,
        width: 64,
        height: 64,
    },
    g => new DefaultGameReward(g),
)

const inputBuffer = Buffer.alloc(1)

const envWrapped: Environment = {
    reset: () => {
        const [image, addedFeatures] = env.reset()

        const imageArray = Array.from(image)
        const addedFeaturesArray = Array.from(addedFeatures)

        return addedFeaturesArray.concat(imageArray)
    },
    step: (action: number | number[]) => {
        if (Array.isArray(action)) {
            action = action[0]
        }

        inputBuffer.writeUInt8(action, 0)
        const [reward, done, image, addedFeatures] = env.step(inputBuffer)

        const imageArray = Array.from(image)
        const addedFeaturesArray = Array.from(addedFeatures)

        return [addedFeaturesArray.concat(imageArray), reward, done]
    },
}

function model() {
    const featureCount = 6

    const width = 64
    const height = 64

    const input = tf.input({ shape: [width * height * 3 + featureCount] })

    const splitLayer = new SplitLayer(featureCount)
    const x = splitLayer.apply(input)
    console.log("x: ", x)
    let [addedFeatures, image] = x as tf.SymbolicTensor[]

    image = tf.layers
        .conv2d({
            filters: 16,
            kernelSize: 8,
            strides: 4,
            activation: "relu",
        })
        .apply(image) as tf.SymbolicTensor

    image = tf.layers
        .conv2d({
            filters: 32,
            kernelSize: 4,
            strides: 2,
            activation: "relu",
        })
        .apply(image) as tf.SymbolicTensor

    image = tf.layers
        .conv2d({
            filters: 32,
            kernelSize: 3,
            strides: 1,
            activation: "relu",
        })
        .apply(image) as tf.SymbolicTensor

    const imageFlat = tf.layers.flatten().apply(image)

    const imageReduced = tf.layers.dense({ units: 256 }).apply(imageFlat) as tf.SymbolicTensor

    let features = tf.layers.concatenate().apply([imageReduced, addedFeatures])

    features = tf.layers
        .dense({ units: 256, activation: "relu" })
        .apply(features) as tf.SymbolicTensor

    features = tf.layers
        .dense({ units: 64, activation: "relu" })
        .apply(features) as tf.SymbolicTensor

    return tf.model({ inputs: input, outputs: features })
}

const ppo = new PPO(
    {
        steps: 512,
        epochs: 20,
        policyLearningRate: 1e-4,
        valueLearningRate: 1e-4,
        clipRatio: 0.2,
        targetKL: 0.01,
        gamma: 0.99,
        lambda: 0.95,
        observationDimension: 64 * 64 * 3 + 6,
        actionSpace: {
            class: "Discrete",
            len: 6,
        },
    },
    envWrapped,
    model(),
    model(),
)

ppo.learn(100)

while (true) {}
