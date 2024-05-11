import RAPIER from "custom-rapier2d-node/rapier"
import * as gl from "gl"
import { PNG } from "pngjs"
import { EntityWith, MessageCollector } from "runtime-framework"
import { WorldModel } from "runtime/proto/world"
import { LevelCapturedMessage } from "runtime/src/core/level-capture/level-captured-message"
import { RuntimeComponents } from "runtime/src/core/runtime-components"
import { RuntimeSystemContext } from "runtime/src/core/runtime-system-stack"
import { Runtime, newRuntime } from "runtime/src/runtime"
import * as THREE from "three"
import { GameAgentWrapper } from "web-game/src/game/game-agent-wrapper"
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

    private png: PNG
    private memory: RuntimeSystemContext[] = []
    private previousGamemode = "<none>"

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
        this.reward = this.rewardFactory(this.runtime)

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

        let dx = 0
        let dy = 0
        let inCapture = false

        if (this.targetFlag) {
            dx =
                this.rocket.components.rigidBody.translation().x -
                this.targetFlag.components.level.flag.x
            dy =
                this.rocket.components.rigidBody.translation().y -
                this.targetFlag.components.level.flag.y

            inCapture = this.targetFlag.components.level.inCapture
        }

        this.observationFeatureBuffer.writeFloatLE(this.rocket.components.rigidBody.linvel().x, 0)
        this.observationFeatureBuffer.writeFloatLE(this.rocket.components.rigidBody.linvel().y, 4)
        this.observationFeatureBuffer.writeFloatLE(this.rotation, 8)
        this.observationFeatureBuffer.writeFloatLE(dx, 12)
        this.observationFeatureBuffer.writeFloatLE(dy, 16)
        this.observationFeatureBuffer.writeFloatLE(inCapture ? 1 : 0, 20)
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

interface Environment {
    reset(): [Buffer, Buffer]
    step(action: Buffer): [number, boolean, Buffer, Buffer]
    generatePng(): Buffer
}
