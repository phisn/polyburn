import * as tf from "@tensorflow/tfjs-node-gpu"
import { Buffer } from "buffer"
import { GameEnvironment } from "learning-gym/src/game-environment"
import { WorldModel } from "runtime/proto/world"
import { DefaultGameReward } from "web-game/src/game/reward/default-reward"
import { Environment, PPO } from "./ppo/ppo"

class SplitLayer extends tf.layers.Layer {
    computeOutputShape(inputShape: tf.Shape | tf.Shape[]): tf.Shape | tf.Shape[] {
        if (Array.isArray(inputShape[0])) {
            inputShape = inputShape[0]
        }

        return [
            [inputShape[0], 6],
            [inputShape[0], inputShape[1] - 6],
        ]
    }

    constructor() {
        super()
    }

    call(inputs: tf.Tensor<tf.Rank> | tf.Tensor<tf.Rank>[]): tf.Tensor<tf.Rank>[] {
        if (Array.isArray(inputs)) {
            inputs = inputs[0]
        }

        const len = inputs.shape[1]

        if (len === undefined) {
            throw new Error("Input is too short")
        }

        const left = inputs.slice([0, 0], [-1, 6])
        const right = inputs.slice([0, 6], [-1, len - 6])

        return [left, right]
    }

    static get className() {
        return "SplitLayer"
    }
}

tf.serialization.registerClass(SplitLayer)

const worldStr2 =
    "ClwKBkdsb2JhbBJSEigNzcxUwBXJdsBBJQAA7MEtAADKQTUAAO5BPQAAmMBFAAAAQE0AAABAGiYKJAAANEEAAEA/AAD/AODPAACAgP8AAABAxMDA/wDgTwC0////AAo1CgJGMRIvEi0NMzMbQBWLbFdAHdsPyUAlAADswS0AALhANQAA7kE9AACYwEUAAABATQAAAEAKEgoCRzESDAoKDWZmDsEVZmbEQQoSCgJHMhIMCgoNZmYKwRVmZsJBChIKAkczEgwKCg1mZma/FWZmwkEKEgoCRzQSDAoKDWZmRkAVZmbEQQo1CgJGMhIvEi0NzcwywRWLbFdAHdsPyUAlAACawS0AAMpBNQAAIEE9AACYwEUAAABATQAAAEASHAoITm9ybWFsIDESEAoCRzEKAkYxCgZHbG9iYWwSHAoITm9ybWFsIDISEAoCRzIKAkYxCgZHbG9iYWwSHAoITm9ybWFsIDMSEAoCRzMKAkYxCgZHbG9iYWwSHAoITm9ybWFsIDQSEAoCRzQKAkYxCgZHbG9iYWwSHAoITm9ybWFsIDUSEAoCRjIKAkcxCgZHbG9iYWwSHAoITm9ybWFsIDYSEAoCRjIKAkcyCgZHbG9iYWwSHAoITm9ybWFsIDcSEAoCRjIKAkczCgZHbG9iYWwSHAoITm9ybWFsIDgSEAoCRzQKAkYyCgZHbG9iYWw="

const world = WorldModel.decode(Buffer.from(worldStr2, "base64"))

function newEnvWrapped() {
    const inputBuffer = Buffer.alloc(1)

    function bufferToFloats(buffer: Buffer): number[] {
        const floats = []

        for (let i = 0; i < buffer.length; i += 4) {
            floats.push(buffer.readFloatLE(i))
        }

        return floats
    }

    const modes = [...Array(8).keys()].map(i => `Normal ${i + 1}`)

    const rawEnv = new GameEnvironment(
        world,
        modes,
        {
            grayScale: true,
            stepsPerFrame: 6,
            size: 64,
            pixelsPerUnit: 2,
        },
        g => new DefaultGameReward(g),
    )
    const envWrapped: Environment = {
        reset: () => {
            const [image, addedFeatures] = rawEnv.reset()

            const imageArray = Array.from(image)
            const addedFeaturesArray = bufferToFloats(addedFeatures)

            return addedFeaturesArray.concat(imageArray)
        },
        step: (action: number | number[]) => {
            if (Array.isArray(action)) {
                action = action[0]
            }

            inputBuffer.writeUInt8(action, 0)
            const [reward, done, image, addedFeatures] = rawEnv.step(inputBuffer)

            const imageArray = Array.from(image)
            const addedFeaturesArray = bufferToFloats(addedFeatures)

            return [addedFeaturesArray.concat(imageArray), reward, done]
        },
    }

    return envWrapped
}

const env = newEnvWrapped()
const testEnv = newEnvWrapped()

/*
for (let i = 0; i < 60; ++i) {
    const [, r, done] = env.step(5)
    console.log(r)

    if (done) {
        env.reset()
    }
}
*/

function model() {
    const featureCount = 6
    const size = 64

    const input = tf.input({ shape: [size * size + featureCount] })

    const [addedFeatures, imageFlat] = new SplitLayer(featureCount).apply(
        input,
    ) as tf.SymbolicTensor[]

    let image = tf.layers
        .reshape({ targetShape: [size, size, 1] })
        .apply(imageFlat) as tf.SymbolicTensor

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

    const imageProcessedFlat = tf.layers.flatten().apply(image)

    const imageReduced = tf.layers
        .dense({ units: 256 })
        .apply(imageProcessedFlat) as tf.SymbolicTensor

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
        steps: 2048,
        epochs: 5,
        policyLearningRate: 1e-4,
        valueLearningRate: 1e-4,
        clipRatio: 0.2,
        targetKL: 0.01,
        gamma: 0.99,
        lambda: 0.95,
        actionSpace: {
            class: "Discrete",
            len: 6,
        },
    },
    env,
    model(),
    model(),
)

function testReward() {
    let reward = 0
    let observation = testEnv.reset()

    for (;;) {
        const actionRaw = ppo.act(observation)
        const action = Array.isArray(actionRaw) ? actionRaw[0] : actionRaw

        const [newObservation, r, done] = testEnv.step(0)

        observation = newObservation
        reward += r

        if (done) {
            break
        }
    }

    return reward
}

function averageReward() {
    let sum = 0

    for (let i = 0; i < 16; ++i) {
        sum += testReward()
    }

    return sum / 16
}

ppo.restore()
    .then(() => {
        console.log("Model restored")
    })
    .catch(e => {
        console.log("Model not restored: ", e)
    })
    .finally(async () => {
        let bestReward = averageReward()

        for (let i = 0; ; ++i) {
            ppo.learn(2048 * (i + 1))
            const potential = testReward()

            if (potential > bestReward) {
                const reward = averageReward()

                if (reward > bestReward) {
                    bestReward = reward
                    console.log(`New best reward: ${bestReward}`)

                    await ppo
                        .save()
                        .catch(e => console.log("Model not saved: ", e))
                        .then(() => {
                            console.log("Model saved")
                        })
                } else {
                    console.log(
                        `Iteration ${i + 1}, Reward: ${reward}, Best: ${bestReward} (was considered)`,
                    )
                }
            } else {
                console.log(`Iteration ${i + 1}, Potential: ${potential}, Best: ${bestReward}`)
            }
        }
    })
