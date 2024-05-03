import * as tf from "@tensorflow/tfjs"
import { Buffer } from "buffer"
import { EntityWith, MessageCollector } from "runtime-framework"
import { WorldModel } from "runtime/proto/world"
import { LevelCapturedMessage } from "runtime/src/core/level-capture/level-captured-message"
import { RocketDeathMessage } from "runtime/src/core/rocket/rocket-death-message"
import { RuntimeComponents } from "runtime/src/core/runtime-components"
import { Runtime, newRuntime } from "runtime/src/runtime"
import { Environment, PPO } from "./ppo/ppo"

export class PolyburnEnvironment implements Environment {
    private runtime: Runtime
    private currentRotation: number
    private nearestLevel: EntityWith<RuntimeComponents, "level">

    private captureMessages: MessageCollector<LevelCapturedMessage>
    private deathMessages: MessageCollector<RocketDeathMessage>

    private bestDistance: number
    private maxTime = 60 * 30
    private remainingTime = 60 * 30

    private worldModel: any

    private touchedFlag = false

    constructor() {
        const worldStr =
            "CqAJCgZOb3JtYWwSlQkKDw0fhZ3BFR+FB0Id2w/JQBItDR+FtsEVgZUDQh3bD8lAJQAAEMItpHBhQjWuR9lBPR+Fm0FFAAAAQE0AAABAEi0Nrkc/QRVt5wZCHdsPyUAlAAD4QC2kcBZCNezRjUI94KMwP0UAAABATQAAAEASLQ2k8B5CFX9qWEEd2w/JQCUAAP5BLaRwFkI17NG9Qj3gozA/RQAAAEBNAAAAQBItDeyRm0IVPzWGQR3bD8lAJQCAjUItSOHsQTX26AVDPYTr6cBFAAAAQE0AAABAEi0Nw0XwQhUcd4lAHTMeejwlAIDnQi2kcA5CNfboMkM9EK6nv0UAAABATQAAAEASLQ2PYhxDFT813EEd2w/JQCUAAM9CLaRwbEI1AMAmQz0fhbFBRQAAAEBNAAAAQBItDcM15UIVYxBJQh3bD8lAJQAAeUItUrijQjXs0fpCPZDCM0JFAAAAQE0AAABAEi0N9WiFQhXVeIhCHdsPyUAlw7WBQi3sUY9CNcO1kUI9AACBQkUAAABATQAAAEAaTgpMpHA9wXE9ukHAwP8AAEAAPYCA/wAAtIBDAAD/AIDFAEBAQP8AgMgAAICA/wBAxgC+oKD/AABGAMf///8AV0dxQry8+QBSQPHA////ABpOCkyuR3FBSOHKQf/++ABAxgAA//3wAAA/QMT/++AAQEoAQv/3wAAAPkBF/++AAADHAD//3gAAgMYAAP/vgAAAAIDD////AKxGCq////8AGpcCCpQC9qjBQpqZJEL///8AMNEAOv///wDqy9pH////AOzHNML///8AAMIAx////wAAQkDE////AABFAL3///8AAELAx////wCARgBF////AEBGgMb///8AwEYAv////wAgSQBF////AOBIgMP///8A4EjAR////wAARYDE////AAC+oMj///8AAD8AAP///wAAAODK////AGBJAEf///8AwMTASP///wAgSQAA////AEBEwMb///8AAEOAQ////wBASQC/////AAA+wEj///8AwEqAw////wAAvMBL////AODIAAD///8AQMoAQP///wAAPgBI////ACDIAAD///8AgMCARv///wCAyQAA////AEBFgMb///8AGqcCCqQCpHAZQqRwOcH///8AmFgAwP///wCAxwhU////AGDK4E3///8AwM1gyf///wAAv+DI////AKBLAMP///8AADpgyf///wCARgAA////AAA6YMv///8AQMgAAP///wAAvuDJ////AIBFYMj///8AQMyAwf///wAAtMDG////AGDLAL3///8AOMAMSP///wAkxgCu////AADC4Mj///8AAMNARv///wBgyQAA////AEDHgMP///8AwMeAQf///wAAAEBM////ACDJAAD///8AgMMAx////wAAyoBC////AAC9AMb///8AgMTARf///wCAwIDB////AABFAML///8AAMgANP///wBAxEBG////AADHAAD///8AAMFAyP///wBgyEDE////ABomCiSPQopCcT2DQv/AjQAAxAAA/+R0AAAAAMT/kwAAAEQAAP+bAAASEgoGTm9ybWFsEggKBk5vcm1hbA=="
        this.worldModel = WorldModel.decode(Buffer.from(worldStr, "base64"))

        this.runtime = newRuntime(this.worldModel, "Normal")

        this.currentRotation = 0

        const rocket = this.runtime.factoryContext.store.find("rocket", "rigidBody")[0]
        const rocketPosition = rocket.components.rigidBody.translation()

        this.captureMessages = this.runtime.factoryContext.messageStore.collect("levelCaptured")
        this.deathMessages = this.runtime.factoryContext.messageStore.collect("rocketDeath")

        this.nearestLevel = this.runtime.factoryContext.store
            .find("level")
            .filter(level => level.components.level.captured === false)
            .sort(
                (a, b) =>
                    Math.abs(a.components.level.flag.x - rocketPosition.x) -
                    Math.abs(b.components.level.flag.y - rocketPosition.x),
            )[0]

        const { distance } = this.state()
        this.bestDistance = distance
    }

    inputFromAction(action: number[]) {
        const input = {
            rotation: this.currentRotation + action[0],
            thrust: action[1] > 0 ? true : false,
        }

        return input
    }

    step(action: number | number[]): [number[], number, boolean] {
        if (typeof action === "number") {
            throw new Error("Wrong action type")
        }

        this.remainingTime--

        const input = this.inputFromAction(action)
        this.currentRotation += action[0]

        this.runtime.step(input)

        const { distance, observation, velMag, angDiff } = this.state()

        let newTouch = false

        if (this.nearestLevel.components.level.inCapture) {
            if (!this.touchedFlag) {
                newTouch = true
            }

            this.touchedFlag = true
        }

        const captureMessage = [...this.captureMessages].at(-1)

        if (captureMessage) {
            const reward = 10000 + (this.maxTime - this.remainingTime) * 100
            return [observation, reward, true]
        }

        const deathMessage = [...this.deathMessages].at(-1)

        if (deathMessage) {
            const reward = -(velMag + angDiff)
            return [observation, reward, true]
        }

        const reward = Math.max(0, this.bestDistance - distance)
        this.bestDistance = Math.min(this.bestDistance, distance)

        const done = this.remainingTime <= 0

        return [observation, reward * 10 + (newTouch ? 100 : 0), done]
    }

    state() {
        const rocket = this.runtime.factoryContext.store.find("rocket", "rigidBody")[0]

        const rocketPosition = rocket.components.rigidBody.translation()
        const rocketRotation = rocket.components.rigidBody.rotation()
        const rocketVelocity = rocket.components.rigidBody.linvel()

        const dx = this.nearestLevel.components.level.flag.x - rocketPosition.x
        const dy = this.nearestLevel.components.level.flag.y - rocketPosition.y

        const distanceToLevel = Math.sqrt(dx * dx + dy * dy)

        const angDiff =
            (this.nearestLevel.components.level.flagRotation -
                rocket.components.rigidBody.rotation()) %
            (Math.PI * 2)

        const velMag = Math.sqrt(
            rocketVelocity.x * rocketVelocity.x + rocketVelocity.y * rocketVelocity.y,
        )

        return {
            distance: distanceToLevel,
            observation: [
                this.nearestLevel.components.level.flag.x - rocketPosition.x,
                this.nearestLevel.components.level.flag.y - rocketPosition.y,
                rocketRotation,
                rocketVelocity.x,
                rocketVelocity.y,
            ],
            touched: this.touchedFlag,
            angDiff,
            velMag,
        }
    }

    reset(): number[] {
        this.runtime = newRuntime(this.worldModel, "Normal")

        this.currentRotation = 0

        const rocket = this.runtime.factoryContext.store.find("rocket", "rigidBody")[0]
        const rocketPosition = rocket.components.rigidBody.translation()

        this.captureMessages = this.runtime.factoryContext.messageStore.collect("levelCaptured")
        this.deathMessages = this.runtime.factoryContext.messageStore.collect("rocketDeath")

        this.nearestLevel = this.runtime.factoryContext.store
            .find("level")
            .filter(level => level.components.level.captured === false)
            .sort(
                (a, b) =>
                    Math.abs(a.components.level.flag.x - rocketPosition.x) -
                    Math.abs(b.components.level.flag.y - rocketPosition.x),
            )[0]

        const { distance, observation } = this.state()

        this.bestDistance = distance
        this.remainingTime = this.maxTime
        this.touchedFlag = false

        return observation
    }
}

export class CartPole implements Environment {
    private gravity: number
    private massCart: number
    private massPole: number
    private totalMass: number
    private cartWidth: number
    private cartHeight: number
    private length: number
    private poleMoment: number
    private forceMag: number
    private tau: number

    private xThreshold: number
    private thetaThreshold: number

    private x: number = 0
    private xDot: number = 0
    private theta: number = 0
    private thetaDot: number = 0

    /**
     * Constructor of CartPole.
     */
    constructor() {
        // Constants that characterize the system.
        this.gravity = 9.8
        this.massCart = 1.0
        this.massPole = 0.1
        this.totalMass = this.massCart + this.massPole
        this.cartWidth = 0.2
        this.cartHeight = 0.1
        this.length = 0.5
        this.poleMoment = this.massPole * this.length
        this.forceMag = 10.0
        this.tau = 0.02 // Seconds between state updates.

        // Threshold values, beyond which a simulation will be marked as failed.
        this.xThreshold = 2.4
        this.thetaThreshold = (12 / 360) * 2 * Math.PI

        this.reset()
    }

    /**
     * Get current state as a tf.Tensor of shape [1, 4].
     */
    getStateTensor() {
        return [this.x, this.xDot, this.theta, this.thetaDot]
    }

    private i = 0
    private max = 0

    /**
     * Update the cart-pole system using an action.
     * @param {number} action Only the sign of `action` matters.
     *   A value > 0 leads to a rightward force of a fixed magnitude.
     *   A value <= 0 leads to a leftward force of the same fixed magnitude.
     */
    step(action: number | number[]): [number[], number, boolean] {
        if (Array.isArray(action)) {
            action = action[0]
        }

        const force = action * this.forceMag

        const cosTheta = Math.cos(this.theta)
        const sinTheta = Math.sin(this.theta)

        const temp =
            (force + this.poleMoment * this.thetaDot * this.thetaDot * sinTheta) / this.totalMass
        const thetaAcc =
            (this.gravity * sinTheta - cosTheta * temp) /
            (this.length * (4 / 3 - (this.massPole * cosTheta * cosTheta) / this.totalMass))
        const xAcc = temp - (this.poleMoment * thetaAcc * cosTheta) / this.totalMass

        // Update the four state variables, using Euler's method.
        this.x += this.tau * this.xDot
        this.xDot += this.tau * xAcc
        this.theta += this.tau * this.thetaDot
        this.thetaDot += this.tau * thetaAcc

        const reward = this.isDone() ? -100 : 1
        return [this.getStateTensor(), reward, this.isDone()]
    }

    /**
     * Set the state of the cart-pole system randomly.
     */
    reset() {
        this.i = 0
        // The control-theory state variables of the cart-pole system.
        // Cart position, meters.
        this.x = Math.random() - 0.5
        // Cart velocity.
        this.xDot = (Math.random() - 0.5) * 1
        // Pole angle, radians.
        this.theta = (Math.random() - 0.5) * 2 * ((6 / 360) * 2 * Math.PI)
        // Pole angle velocity.
        this.thetaDot = (Math.random() - 0.5) * 0.5

        return this.getStateTensor()
    }

    /**
     * Determine whether this simulation is done.
     *
     * A simulation is done when `x` (position of the cart) goes out of bound
     * or when `theta` (angle of the pole) goes out of bound.
     *
     * @returns {bool} Whether the simulation is done.
     */
    isDone() {
        return (
            this.x < -this.xThreshold ||
            this.x > this.xThreshold ||
            this.theta < -this.thetaThreshold ||
            this.theta > this.thetaThreshold
        )
    }
}

import "@tensorflow/tfjs-backend-webgl"
import "@tensorflow/tfjs-backend-webgpu"
import { SoftActorCritic } from "./soft-actor-critic/soft-actor-critic"

if (false) {
    tf.setBackend("cpu").then(() => {
        const sac = new SoftActorCritic({
            mlpSpec: {
                sizes: [32, 32],
                activation: "relu",
                outputActivation: "relu",
            },

            actionSize: 1,
            observationSize: 4,

            maxEpisodeLength: 1000,
            bufferSize: 1e6,
            batchSize: 100,
            updateAfter: 1000,
            updateEvery: 50,

            learningRate: 1e-3,
            alpha: 0.2,
            gamma: 0.99,
            polyak: 0.995,
        })

        sac.test()

        /*
        const actor = new Actor(4, 2, {
            sizes: [32, 32],
            activation: "relu",
            outputActivation: "relu",
        })

        actor.trainableWeights.forEach(w => {
            w.write(tf.zeros(w.shape, w.dtype))
        })

        /*
        x = torch.tensor([[0.1, 0.2, 0.3, 0.4]], dtype=torch.float32)
        x = actor(x, True)

        const x = tf.tensor2d([[0.1, 0.2, 0.3, 0.4]])
        const r = actor.apply(x, { deterministic: true }) as tf.Tensor<tf.Rank>[]

        console.log(r[0].dataSync())
        console.log(r[1].dataSync())
        */
    })
}

if (true) {
    tf.setBackend("cpu").then(() => {
        const env = new CartPole()

        const sac = new SoftActorCritic({
            mlpSpec: {
                sizes: [32, 32],
                activation: "relu",
                outputActivation: "relu",
            },

            actionSize: 1,
            observationSize: 4,

            maxEpisodeLength: 1000,
            bufferSize: 1e6,
            batchSize: 100,
            updateAfter: 1000,
            updateEvery: 50,

            learningRate: 1e-3,
            alpha: 0.2,
            gamma: 0.99,
            polyak: 0.995,
        })

        function currentReward() {
            const acc = []

            for (let j = 0; j < 10; ++j) {
                env.reset()

                let t = 0

                while (!env.isDone() && t < 1000) {
                    env.step(sac.act(env.getStateTensor(), true))
                    t++
                }

                acc.push(t)
            }

            // average of top 10% lifetimes
            acc.sort((a, b) => b - a)

            const best10avg = acc.slice(0, 10).reduce((a, b) => a + b, 0) / 10
            const worst10avg = acc.slice(-10).reduce((a, b) => a + b, 0) / 10
            const avg = acc.reduce((a, b) => a + b, 0) / acc.length

            return { avg, best10avg, worst10avg }
        }

        let t = 0
        let updated = false

        function iteration() {
            for (let i = 0; i < 16; ++i) {
                t++

                const observation = env.getStateTensor()

                let action: number[]

                if (t < 1000) {
                    action = [Math.random()]
                } else {
                    action = sac.act(observation, false)
                }

                const [nextObservation, reward, done] = env.step(action)

                const thisTimeUpdated = sac.observe({
                    observation,
                    action,
                    reward,
                    nextObservation,
                    done,
                })

                updated ||= thisTimeUpdated

                if (done) {
                    if (updated) {
                        const { avg, best10avg, worst10avg } = currentReward()

                        console.log(`Leaks: ${tf.memory().numTensors}`)
                        console.log(`10%: ${best10avg}, 90%: ${worst10avg}, avg: ${avg}`)
                    }

                    env.reset()

                    updated = false
                }
            }

            requestAnimationFrame(iteration)
        }

        console.log("Start")
        requestAnimationFrame(iteration)

        /*
        const ppo = new PPO(
            {
                steps: 512,
                epochs: 15,
                policyLearningRate: 1e-3,
                valueLearningRate: 1e-3,
                clipRatio: 0.1,
                targetKL: 0.01,
                gamma: 0.99,
                lambda: 0.95,
                observationDimension: 4,
                actionSpace: {
                    class: "Discrete",
                    len: 2,
                },
            },
            env,
            tf.sequential({
                layers: [
                    tf.layers.dense({
                        inputDim: 4,
                        units: 32,
                        activation: "relu",
                    }),
                    tf.layers.dense({
                        units: 32,
                        activation: "relu",
                    }),
                ],
            }),
            tf.sequential({
                layers: [
                    tf.layers.dense({
                        inputDim: 4,
                        units: 32,
                        activation: "relu",
                    }),
                    tf.layers.dense({
                        units: 32,
                        activation: "relu",
                    }),
                ],
            }),
        )

        function possibleLifetime() {
            const acc = []

            for (let j = 0; j < 25; ++j) {
                env.reset()

                let t = 0

                while (!env.isDone() && t < 1000) {
                    env.step(ppo.act(env.getStateTensor()) as number[])
                    t++
                }

                acc.push(t)
            }

            // average of top 10% lifetimes
            acc.sort((a, b) => b - a)

            const best10avg = acc.slice(0, 10).reduce((a, b) => a + b, 0) / 10
            const worst10avg = acc.slice(-10).reduce((a, b) => a + b, 0) / 10
            const avg = acc.reduce((a, b) => a + b, 0) / acc.length

            return { avg, best10avg, worst10avg }
        }

        let currentAverage = 0
        let i = 0

        function iteration() {
            ppo.learn(512 * i)

            const { avg, best10avg, worst10avg } = possibleLifetime()

            console.log(`Leaks: ${tf.memory().numTensors}`)
            console.log(`10%: ${best10avg}, 90%: ${worst10avg}, avg: ${avg}`)

            if (avg > currentAverage) {
                // await ppo.save()
                currentAverage = avg
                console.log("Saved")
            }

            i++

            requestAnimationFrame(iteration)
        }

        console.log("Initial: ", possibleLifetime())

        console.log("Start")
        requestAnimationFrame(iteration)

    */
    })
}

if (false) {
    tf.setBackend("cpu").then(() => {
        const env = new PolyburnEnvironment()

        const inputDim = 5

        const ppo = new PPO(
            {
                steps: 512,
                epochs: 15,
                policyLearningRate: 1e-3,
                valueLearningRate: 1e-3,
                clipRatio: 0.2,
                targetKL: 0.01,
                gamma: 0.99,
                lambda: 0.95,
                observationDimension: inputDim,
                actionSpace: {
                    class: "Box",
                    len: 2,
                    low: -1,
                    high: 1,
                },
            },
            env,
            tf.sequential({
                layers: [
                    tf.layers.dense({
                        inputDim: inputDim,
                        units: 64,
                        activation: "relu",
                    }),
                    tf.layers.dense({
                        units: 64,
                        activation: "relu",
                    }),
                ],
            }),
            tf.sequential({
                layers: [
                    tf.layers.dense({
                        inputDim: inputDim,
                        units: 64,
                        activation: "relu",
                    }),
                    tf.layers.dense({
                        units: 64,
                        activation: "relu",
                    }),
                ],
            }),
        )

        function possibleLifetime() {
            let observation = env.reset()

            let totalReward = 0
            const inputs = []

            while (true) {
                const action = ppo.act(observation)
                inputs.push(env.inputFromAction(action as number[]))

                const [nextObservation, reward, done] = env.step(action)

                totalReward += reward
                observation = nextObservation

                if (done) {
                    break
                }
            }

            return {
                totalReward,
                touched: env.state().touched,
                distance: env.state().distance,
                inputs,
            }
        }

        let currentAverage = 0
        let i = 0

        const previousTwenty: number[] = []

        function iteration() {
            ppo.learn(512 * i)
            const info = possibleLifetime()

            console.log(
                `Reward ${i}: reward(${info.totalReward}), distance(${info.distance}), touched(${info.touched})`,
            )

            if (info.totalReward > currentAverage && previousTwenty.length === 20) {
                currentAverage = info.totalReward
                console.log("Saved")
                ppo.save()
            }

            if (previousTwenty.length === 20) {
                previousTwenty.shift()
            }

            previousTwenty.push(info.totalReward)

            const avgPreviousTwenty =
                previousTwenty.reduce((a, b) => a + b, 0) / previousTwenty.length

            ++i

            if (
                avgPreviousTwenty < 50 &&
                avgPreviousTwenty < Math.max(currentAverage, 10) * 0.5 &&
                previousTwenty.length === 20
            ) {
                console.log("Restoring")

                ppo.restore().finally(() => {
                    requestAnimationFrame(iteration)
                })
            } else {
                requestAnimationFrame(iteration)
            }
        }

        ppo.restore().finally(() => {
            const { totalReward, inputs } = possibleLifetime()
            currentAverage = totalReward

            console.log(JSON.stringify(inputs))

            console.log("Start with: ", currentAverage)
            requestAnimationFrame(iteration)
        })
    })
}
