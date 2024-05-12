import RAPIER from "custom-rapier2d-node/rapier"
import * as gl from "gl"
import { PNG } from "pngjs"
import { EntityWith, MessageCollector } from "runtime-framework"
import { ReplayModel } from "runtime/proto/replay"
import { WorldModel } from "runtime/proto/world"
import { LevelCapturedMessage } from "runtime/src/core/level-capture/level-captured-message"
import { RuntimeComponents } from "runtime/src/core/runtime-components"
import { RuntimeSystemContext } from "runtime/src/core/runtime-system-stack"
import { Runtime, newRuntime } from "runtime/src/runtime"
import * as THREE from "three"
import { GameAgentWrapper } from "web-game/src/game/game-agent-wrapper"
import {
    ReplayFollowTracker,
    ReplayProcessed,
    processReplayForAgent,
} from "web-game/src/game/reward/replay-follow-tracker"
import { Reward, RewardFactory } from "../../web-game/src/game/reward/default-reward"

export interface GameEnvironmentConfig {
    grayScale: boolean
    size: number
    pixelsPerUnit: number
    stepsPerFrame: number
}

export class GameEnvironment {
    private observationImageBuffer: Buffer
    private observationFeatureBuffer: Buffer
    private imageBuffer: Buffer
    private imageChannels: number

    private runtime!: Runtime
    private reward!: Reward
    private game!: GameAgentWrapper
    private renderer: THREE.WebGLRenderer

    private rotation!: number
    private rocket!: EntityWith<RuntimeComponents, "rocket" | "rigidBody">
    private targetFlag: EntityWith<RuntimeComponents, "level"> | undefined
    private capturedCollector!: MessageCollector<LevelCapturedMessage>
    private replayTracker!: ReplayFollowTracker

    private png: PNG
    private memory: RuntimeSystemContext[] = []
    private previousGamemode = "<none>"

    private replayProcessed: ReplayProcessed | undefined

    constructor(
        private world: WorldModel,
        private gamemodes: string[],
        private config: GameEnvironmentConfig,
        private rewardFactory: RewardFactory,
    ) {
        this.imageChannels = config.grayScale ? 1 : 3

        // features (4 bytes)
        // - velocity x
        // - velocity y
        // - rotation
        // - distance to flag x
        // - distance to flag y
        // - flag in capture
        this.observationFeatureBuffer = Buffer.alloc(4 * 6)

        // image (3 channels)
        this.observationImageBuffer = Buffer.alloc(
            config.size * config.size * (config.grayScale ? 1 : 3),
        )

        // source image has additionally alpha channel
        this.imageBuffer = Buffer.alloc(config.size * config.size * 4)

        this.png = new PNG({
            width: config.size,
            height: config.size,
        })

        const canvas = {
            width: config.size,
            height: config.size,
            addEventListener: () => {},
            removeEventListener: () => {},
        }

        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas as any,
            antialias: false,
            powerPreference: "high-performance",
            context: gl.default(config.size, config.size, {
                preserveDrawingBuffer: true,
            }),
            depth: false,
        })

        const renderTarget = new THREE.WebGLRenderTarget(config.size, config.size)
        this.renderer.setRenderTarget(renderTarget)

        this.reset()
    }

    getGamemode() {
        return this.previousGamemode
    }

    reset(): [Buffer, Buffer] {
        if (this.runtime) {
            /*
            console.log(
                `memory(b64) ${this.previousGamemode} `,
                Buffer.from(JSON.stringify(this.memory)).toString("base64"),
            )
            */

            this.runtime.factoryContext.physics.free()
        }

        this.memory = []

        this.previousGamemode = this.gamemodes[Math.floor(Math.random() * this.gamemodes.length)]

        this.runtime = newRuntime(RAPIER as any, this.world, this.previousGamemode)

        if (this.replayProcessed === undefined) {
            const replayToFollow =
                "CuUmcggAAAAACGaizaTNpGaeZp5momemZqrNqACozaTNpGWeZp4AAAFmomeeZ54AAAVmnmaiZ54AAAFnngAAAWaeZ55mngAABGaeAAACZ54AAAdmIs0kMyuaKTMtZyozLZopzChnKgAozShlIgAAAmYeZx5mHgAAAWYeAAAFZp5momeiZqZnomaeZ6Jmos2kZp5momeiZqJmogAABGeeAAAFZh5mImciZiJnIs0kzCTNJGciZh4AAAFnHgAADM2kzaRmps2kzajMpGeiZp5nnmaeAAABZ54AAAFmngAAWWaiZ6YAqACoZZ5momeeZp5nomaeZqJnngAAAWaeZqJnomaiZ54AAAJmnmeiZp4AAAJmngAACmYeZx4AAANmHmceAAAMZ55mnmaiZ6JmomeiZp5mngAAAmaiZ6IAAAFmomeeZqJnomaiZ55mnmaiZ55nos2kzKRongAAGWaiZ6Jmps2kzagAqGamZ55mngAACGYeAAABZiJnHmceZh5nHgAAAWYeZh5nHmYeAAABZx5mHs0kZh5mImciZh7NJGYiZibNJM0kzSQAKGYmZiZnJs0kZibNJGYiZibNJGcmzCQAKGcmZiaaKWYmACjNJGYiZh4AAAJmHmceZh5mIgAAAWcezSTNKMwkAChnImYiZx5nHgAABmYeAAABZh5nHmYeAAABZx4AADJnnmaeZqJnnmeeAAAHZp5nngAAAWaeZp5nnmaiZ6IAAAJmngAAC2aeZqJnns2kZp5momeeZ55momeiAAAOZp5momeeZqIAAAFnngAAAmaeAAABZ54AAAFmnmaiZ6ZmomaiZ55mos2kzaRmomaezaRmngAAAWaeAAAXZh4AAAdnHgAAAmYeZx4AAAFmHgAAAWYeAABTzaTMpGieZ6JmomaizaTNqM2oZqrNqGaszajNqDOrAKjNqGemZqbNpACozaTNpACoZqbNpGaiAAABZp4AAApmHgAABmYeAAACZx5mHmceZh5mHmciZh5mHmYiZyJmImceZh4AAAFnHmYeZh5nHmYeAAABZx5mHmYezSRmHmYiZyJmImcizSRlHmYiZx5mImciZh5mHmciZiJmImcmZiJmJmceZiJnHmYmZyZmJjMrzSgzK2cmzShmImYeZh4AABJmomeeZqJnnmaeZ6JmnmaeZp4AAAJnnmaeAAABZ55mngAAAmaeZ55mngAA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"

            this.replayProcessed = processReplayForAgent(
                ReplayModel.decode(Buffer.from(replayToFollow, "base64")),
                this.runtime,
            )
        }

        this.replayTracker = new ReplayFollowTracker(this.runtime, this.replayProcessed)

        this.game = new GameAgentWrapper(
            this.runtime,
            new THREE.Scene() as any,
            this.config.grayScale,
            (0.5 * this.config.size) / this.config.pixelsPerUnit,
        )

        this.rocket = this.runtime.factoryContext.store.find("rocket", "rigidBody")[0]
        this.capturedCollector = this.runtime.factoryContext.messageStore.collect("levelCaptured")
        this.targetFlag = nextFlag(this.runtime, this.rocket)
        this.rotation = 0
        this.reward = this.rewardFactory(this.runtime, this.replayTracker)

        this.extractPixelsToObservationBuffer()
        this.prepareFeatureBuffer()

        return [this.observationImageBuffer, this.observationFeatureBuffer]
    }

    step(action: Buffer): [number, boolean, Buffer, Buffer] {
        const sourceRotation = this.rotation
        const thrust = this.stepWithActionToInput(action.readInt8(0))

        const [reward, done] = this.reward.next(() => {
            for (let i = 0; i < this.config.stepsPerFrame; ++i) {
                const input = {
                    thrust,
                    rotation:
                        sourceRotation +
                        (this.rotation - sourceRotation) * ((i + 1) / this.config.stepsPerFrame),
                }

                // this.memory.push(input)
                this.game.step(input)
            }
        })

        this.renderer.render(this.game.sceneModule.getScene() as any, this.game.camera as any)

        this.extractPixelsToObservationBuffer()
        this.prepareFeatureBuffer()

        return [reward, done, this.observationImageBuffer, this.observationFeatureBuffer]
    }

    stepWithActionToInput(action: number): boolean {
        switch (action) {
            case 0:
                return false
            case 1:
                this.rotation += 0.1
                return false
            case 2:
                this.rotation -= 0.1
                return false
            case 3:
                return true
            case 4:
                this.rotation += 0.1
                return true
            case 5:
                this.rotation -= 0.1
                return true
            default:
                throw new Error(`Invalid action: ${action}`)
        }
    }

    extractPixelsToObservationBuffer() {
        this.renderer
            .getContext()
            .readPixels(
                0,
                0,
                this.renderer.getContext().drawingBufferWidth,
                this.renderer.getContext().drawingBufferHeight,
                this.renderer.getContext().RGBA,
                this.renderer.getContext().UNSIGNED_BYTE,
                this.imageBuffer,
            )

        // The framebuffer coordinate space has (0, 0) in the bottom left, whereas images usually
        // have (0, 0) at the top left. Vertical flipping follows:
        for (let row = 0; row < this.config.size; row += 1) {
            for (let column = 0; column < this.config.size; column++) {
                const index = ((this.config.size - row - 1) * this.config.size + column) * 4

                if (this.config.grayScale) {
                    // we use a cheap grayscale conversion
                    const value =
                        this.imageBuffer[index] |
                        this.imageBuffer[index + 1] |
                        this.imageBuffer[index + 2]

                    this.observationImageBuffer[row * this.config.size + column] = value
                } else {
                    const targetIndex = (row * this.config.size + column) * 3

                    this.observationImageBuffer[targetIndex] = this.imageBuffer[index]
                    this.observationImageBuffer[targetIndex + 1] = this.imageBuffer[index + 1]
                    this.observationImageBuffer[targetIndex + 2] = this.imageBuffer[index + 2]
                }
            }
        }
    }

    prepareFeatureBuffer() {
        for (const message of this.capturedCollector) {
            this.targetFlag = nextFlag(this.runtime, this.rocket)
        }

        let inCapture = false

        if (this.targetFlag) {
            inCapture = this.targetFlag.components.level.inCapture
        }

        const target = this.replayTracker.next()

        const dxTarget = target.x - this.rocket.components.rigidBody.translation().x
        const dyTarget = target.y - this.rocket.components.rigidBody.translation().y

        this.observationFeatureBuffer.writeFloatLE(
            this.rocket.components.rigidBody.linvel().x / 10,
            0,
        )

        this.observationFeatureBuffer.writeFloatLE(
            this.rocket.components.rigidBody.linvel().y / 10,
            4,
        )

        this.observationFeatureBuffer.writeFloatLE(
            this.rocket.components.rigidBody.rotation() / (0.5 * 3.14),
            8,
        )

        this.observationFeatureBuffer.writeFloatLE(dxTarget / 8, 12)
        this.observationFeatureBuffer.writeFloatLE(dyTarget / 8, 16)

        this.observationFeatureBuffer.writeFloatLE(inCapture ? 1 : -1, 20)
    }

    generatePng(): Buffer {
        this.png.data.set(this.observationImageBuffer)

        return PNG.sync.write(this.png, {
            inputColorType: this.config.grayScale ? 0 : 2,
            inputHasAlpha: false,
        })
    }

    generatePixels(): Buffer {
        return this.observationImageBuffer
    }
}

function nextFlag(runtime: Runtime, rocket: EntityWith<RuntimeComponents, "rocket" | "rigidBody">) {
    const distanceToFlag = (flagEntity: EntityWith<RuntimeComponents, "level">) => {
        const dx = rocket.components.rigidBody.translation().x - flagEntity.components.level.flag.x
        const dy = rocket.components.rigidBody.translation().y - flagEntity.components.level.flag.y
        return Math.sqrt(dx * dx + dy * dy)
    }

    const uncapturedLevels = runtime.factoryContext.store
        .find("level")
        .filter(level => !level.components.level.captured)

    if (uncapturedLevels.length === 0) {
        return undefined
    }

    const nextLevel = uncapturedLevels
        .map(level => [level, distanceToFlag(level)] as const)
        .reduce(([minLevel, minDistance], [level, distance]) =>
            distance < minDistance ? [level, distance] : [minLevel, minDistance],
        )[0]

    return nextLevel
}

global.navigator = { userAgent: "node" } as any
