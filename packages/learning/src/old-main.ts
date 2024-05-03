import { Environment, PPO } from "./ppo/ppo"

function getReward(got: number, expected: number) {
    function f() {
        const gotRounded = Math.round(got)

        if (gotRounded === expected) {
            return 0
        }

        if (gotRounded === 0) {
            return expected === -1 ? 1 : -1
        }

        if (gotRounded === 1) {
            return expected === 0 ? 1 : -1
        }

        return expected === 1 ? 1 : -1
    }

    return (f() + 1) / 2
}

const observationSize = 8
const actionSize = 1

const observations = [
    [[-1, -1, -1, -1, -1, -1, -1, -1], [-1]],
    [[0, 0, 0, 0, 0, 0, 0, 0], [0]],
    [[1, 1, 1, 1, 1, 1, 1, 1], [1]],
    [[-1, 0, 1, 0, -1, 0, 1, 0], [-1]],
    [[0, 1, 0, -1, 0, 1, 0, -1], [0]],
    [[1, 0, -1, 0, 1, 0, -1, 0], [1]],
    [[-1, 1, -1, 1, -1, 1, -1, 1], [-1]],
    [[1, -1, 1, -1, 1, -1, 1, -1], [1]],
]

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

        const force = action === 0 ? this.forceMag : -this.forceMag

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

import * as tf from "@tensorflow/tfjs"

tf.setBackend("cpu").then(() => {
    const env = new CartPole()

    const ppo = new PPO(
        {
            steps: 2048,
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

        for (let j = 0; j < 100; ++j) {
            env.reset()

            let t = 0

            while (!env.isDone() && t < 1000) {
                env.step(ppo.act(env.getStateTensor()))
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

    ;(async () => {
        // await ppo.restore()
        let currentAverage = possibleLifetime().avg

        for (let i = 0; i < 500; ++i) {
            ppo.learn(1000 * i)

            const { avg, best10avg, worst10avg } = possibleLifetime()

            console.log(`Leaks: ${tf.memory().numTensors}`)
            console.log(`10%: ${best10avg}, 90%: ${worst10avg}, avg: ${avg}`)

            if (avg > currentAverage) {
                // await ppo.save()
                currentAverage = avg
                console.log("Saved")
            }
        }
    })().then(() => {
        console.log(possibleLifetime())
    })

    /*
import { WorldModel } from "runtime/proto/world"
import { Game } from "./game/game"
import { GameLoop } from "./game/game-loop"
import { GameInstanceType, GameSettings } from "./game/game-settings"
import * as tf from '@tensorflow/tfjs';

function base64ToBytes(base64: string) {
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0))
}

const world =
    "CscCCgZOb3JtYWwSvAIKCg2F65XBFTXTGkISKA2kcLrBFZfjFkIlAAAAwi1SuIlCNa5H+UE9H4X/QUUAAABATQAAAEASKA1SuMFBFZmRGkIlhetRQS3NzFJCNSlcp0I9zcxEQUUAAABATQAAAEASKA0AgEVCFfIboEElAAAoQi0K189BNaRw4UI9rkdZwUUAAABATQAAAEASKA171MBCFcubHcElmpm5Qi0K189BNY/CI0M9rkdZwUUAAABATQAAAEASLQ1syOFCFToytkEdVGuzOiWamblCLSlcZUI1XI8jQz3NzIhBRQAAAEBNAAAAQBItDR/lAUMVk9VNQh2fUDa1JaRw9UItexRsQjWF60FDPQAAlEFFAAAAQE0AAABAEigNw1UzQxVpqkFCJdejJEMtBW94QjXXo0JDPQVvAEJFAAAAQE0AAABACu4KCg1Ob3JtYWwgU2hhcGVzEtwKGt8GCtwGP4UAws3MNEGgEEAAZjYAAP///wB1PAAU////AF5PABT///8AyUtPxP///wAzSg3L////AMBJAcj///8AE0Umzf///wCMVAo5////AJNRpDr///8AVE0WVP///wD0vlZLAAD/AEPI7Bn///8AhcPlOAAA/wAFQZrF////ADS9F8f///8AJMIuwf///wC5xvvF////AOrJ1rf///8Ac8ikQP///wBAxfRF////AGkxi0n///8Aj0LxQgAA/wB1xWY9////AJ/HZAlQUP4AzcUBvQAA/wDwQFzE////ADDGR73///8As8eZPoiI8QBxxWQ3rKz/AFw3LMQAAP8AwkNRtP///wC2RKO4////AEhBe8EAAP8AS0WPPP///wAdSaSx////AMw/Ucj///8A7MBNxv///wDmxnG9////AELCFLr///8Aw8UOof///wAKxCg4AAD/ALg8OMDZ2fsA4j9NwP///wCkxB+/AADwAHGwrr54ePgAVERcwv///wAPwXbA////APW0H0EAAPgASLtnv////wALM67DJSX/AFJApL////8AZj4uwP///wBcu+HATU3/AIU7+8H///8AXMK8Lf///wB7wjM/AAD4AHDCx8D///8AFEH7wP///wAAvnvE////AOTGChL///8A6bncRP///wCAQddAAAD4AB/AxLH///8AIL9RPQAA+ACZwqvG////AOLCLkQAAPgAIcTrwP///wDtwQPH////AOLJbqz///8ALsR6QwAA+AD+x8zA////APtF90kyMv8AH7mZQCcn/wCNxHo8tbX/AIDAiETKyv8AXEAgSgAA+AClyAqS////AH9EG0n///8AS0ypRP///wAxSIK7MDToANjBdUf///8A58yjxP///wCByD1EMDToAIzCYMv///8AnMq3MzA06AC+QenF////ANzGT0T///8AtMFSR////wBzRb85lpj/AFJALEQwNOgAqMIpPjA06AAgyiCF////AAPEE77///8AzT4FSnN1/wAzxWFCMDToAA23PcKXl/8AGcLmQDA06ADMPUnJu77/AFrGxsL///8A1TRGSjA06ACKwik8MDToAE3Apcn///8Ar8SawP///wBsygqP////ABHI8z0wNOgAAABTzv///wAa9wMK9APNzJNCj8JlQP///wBmtly8////ABa2jsg2Nv8AO0SENwAA+ACkvrtEvLz/AG0uOEX///8A4UaHPv///wA+QlXFAAD4AApB2L4AAPgAeDLVRP///wATSHHAAAD4ADhA3EP///8As0MKvAAA8ADOPxM4AAD4AEjBTUD///8Arj5TP3B0+ACyKw9DaGz4ALm6eDz///8AKT4MSP///wDhPy5CAAD/APS/XEL///8A+EV6PwAA/wAdsXtBp6f/AGzEpEEAAP8AisfEuf///wDXwVJI////AJpEaUf///8AhUfxQP///wB7RA3FAAD/ANdBTzUAAP8AC8C9Rv///wBGQoVE////APRMpDz///8A7kS3yAAA/wDLR9HB////AFLHNscAAP8AR0HNwf///wDsvtLGAAD/AABE5kD///8AD0JIRv///wD0RNJA////AEVFqcD///8A3ESpwwAA/wAuwgtJ////AARBqEj///8ALUdbSf///wA01Hks////AHjCAL3///8AF8s5x////wC4vlPP////AME1O8f///8AhsIAPgAA+ABcxZXC7e3/AIrEpUMAAPgAjcbDxcvL/wBdQFzF////AEjI+8EAAOAAQ0GZvf///wAGN77AFRX/APlFXDz///8AikEzwkhI+ADcQmoy////AArNAgoHUmV2ZXJzZRLBAgoPDRydLkMVk5lFQh2z7Zk2EigNpHC6wRWX4xZCJQAAAMItAABMQjUAAEDBPR+F/0FFAAAAQE0AAABAEigNUrjBQRWZkRpCJR+FAMItZuaJQjUAAPpBPQAAAEJFAAAAQE0AAABAEigNAIBFQhXyG6BBJQAAUEEthetRQjWkcKdCPVK4TkFFAAAAQE0AAABAEigNe9TAQhXLmx3BJTQzKEItCtfPQTUeBeJCPa5HWcFFAAAAQE0AAABAEi0NbMjhQhU6MrZBHVRrszolmpm5Qi1SuNRBNVyPI0M9ZmZawUUAAABATQAAAEASLQ0f5QFDFZPVTUIdn1A2tSWk8LlCLXsUZUI1hSskQz0AAIZBRQAAAEBNAAAAQBIoDcNVM0MVaapBQiUAgPVCLQAAbEI1AABCQz0AAJRBRQAAAEBNAAAAQBIhCgZOb3JtYWwSFwoNTm9ybWFsIFNoYXBlcwoGTm9ybWFsEiMKB1JldmVyc2USGAoNTm9ybWFsIFNoYXBlcwoHUmV2ZXJzZQ=="
const worldModel = WorldModel.decode(base64ToBytes(world))

const settings: GameSettings = {
    instanceType: GameInstanceType.Play,
    world: worldModel,
    gamemode: "Normal",
}

try {
    const loop = new GameLoop(new Game(settings))
    loop.start()
} catch (e) {
    console.error(e)
}
*/
})
