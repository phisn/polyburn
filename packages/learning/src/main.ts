import * as tf from "@tensorflow/tfjs-node-gpu"
import { Buffer } from "buffer"
import { mkdirSync, writeFileSync } from "fs"
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

let i = 0

function newEnvWrapped() {
    const inputBuffer = Buffer.alloc(1)

    function bufferToFloats(buffer: Buffer): number[] {
        const floats = []

        for (let i = 0; i < buffer.length; i += 4) {
            floats.push(buffer.readFloatLE(i))
        }

        return floats
    }

    const modes = [...Array(8).keys()]
        .filter(i => i === 8 || i === 5 || i === 7 || i === 6)
        .map(i => `Normal ${i + 1}`)

    const rawEnv = new GameEnvironment(
        world,
        modes,
        {
            grayScale: false,
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

    return [envWrapped, rawEnv] as const
}

const [env, envRaw] = newEnvWrapped()
const [testEnv, testEnvRaw] = newEnvWrapped()

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

    const input = tf.input({ shape: [size * size * 3 + featureCount] })

    const [addedFeatures, imageFlat] = new SplitLayer().apply(input) as tf.SymbolicTensor[]

    let image = tf.layers
        .reshape({ targetShape: [size, size, 3] })
        .apply(imageFlat) as tf.SymbolicTensor

    image = tf.layers
        .conv2d({
            filters: 32,
            kernelSize: 8,
            strides: 4,
            activation: "relu",
        })
        .apply(image) as tf.SymbolicTensor

    image = tf.layers
        .conv2d({
            filters: 64,
            kernelSize: 4,
            strides: 2,
            activation: "relu",
        })
        .apply(image) as tf.SymbolicTensor

    image = tf.layers
        .conv2d({
            filters: 64,
            kernelSize: 3,
            strides: 1,
            activation: "relu",
        })
        .apply(image) as tf.SymbolicTensor

    let features = tf.layers
        .concatenate()
        .apply([tf.layers.flatten().apply(image) as tf.SymbolicTensor, addedFeatures])

    features = tf.layers
        .dense({ units: 256, activation: "relu" })
        .apply(features) as tf.SymbolicTensor

    features = tf.layers
        .dense({ units: 512, activation: "relu" })
        .apply(features) as tf.SymbolicTensor

    return tf.model({ inputs: input, outputs: features })
}

const ppo = new PPO(
    {
        steps: 256,
        epochs: 3,
        policyLearningRate: 2e-4,
        valueLearningRate: 2e-4,
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

        const [newObservation, r, done] = testEnv.step(action)

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

    for (let i = 0; i < 8; ++i) {
        sum += testReward()
    }

    return sum / 8
}

function saveReward() {
    let bestActions: number[] = []
    let bestImages: Buffer[] = []
    let bestReward = -Infinity

    let rewardSum = 0

    const rewardsInMode: Record<string, number> = {}

    for (let i = 0; i < 16; ++i) {
        const actions: number[] = []
        const images: Buffer[] = []
        let reward = 0

        let observation = testEnv.reset()

        for (;;) {
            const actionRaw = ppo.act(observation)
            const action = Array.isArray(actionRaw) ? actionRaw[0] : actionRaw

            const [newObservation, r, done] = testEnv.step(action)
            observation = newObservation

            actions.push(action)
            images.push(testEnvRaw.generatePng())
            reward += r

            if (done) {
                break
            }
        }

        rewardsInMode[testEnvRaw.getGamemode()] = reward

        if (reward > bestReward) {
            bestReward = reward
            bestActions = actions
            bestImages = images
        }

        rewardSum += reward
    }

    const time = new Date().toISOString().replace(/:/g, "-")

    const rewardStr = bestReward.toFixed(2) + "_" + (rewardSum / 16).toFixed(2)
    mkdirSync(`imgs/${time}__${rewardStr}`, { recursive: true })

    const policy = {
        gamemode: testEnvRaw.getGamemode(),
        actions: bestActions,
    }

    for (let i = 0; i < bestImages.length; ++i) {
        writeFileSync(`imgs/${time}__${rewardStr}/frame_${i}.png`, bestImages[i])
    }

    writeFileSync(`imgs/${time}__${rewardStr}/rewards.json`, JSON.stringify(rewardsInMode))
    writeFileSync(`imgs/${time}__${rewardStr}/policy.json`, JSON.stringify(policy))

    env.reset()

    return bestReward
}

ppo.restore()
    .then(() => {
        console.log("Model restored")
    })
    .catch(e => {
        console.log("Model not restored: ", e)
    })
    .finally(async () => {
        const start = (averageReward() + averageReward() + averageReward() + averageReward()) / 4
        console.log(`Initial average reward: ${start}`)

        for (let i = 0; i < 50; ++i) {
            ppo.learn()

            const potential = testReward()
            console.log(`(${i + 1}) Potential reward: ${potential}, start: ${start}`)
        }

        console.log(`Final best reward: ${saveReward()}`)

        await ppo
            .save()
            .catch(e => {
                console.log("Model not saved: ", e)
            })
            .then(() => {
                console.log("Model saved")
            })

        process.exit(0)
    })
