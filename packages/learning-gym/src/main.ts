import RAPIER from "custom-rapier2d-node/rapier"
import * as gl from "gl"
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
    width: number
    height: number
    stepsPerFrame: number
}

export class GameEnvironment {
    private observationImageBuffer: Buffer
    private observationFeatureBuffer: Buffer
    private imageBuffer: Buffer

    private runtime!: Runtime
    private reward!: Reward
    private game!: GameAgentWrapper
    private renderer: THREE.WebGLRenderer

    private rotation!: number
    private rocket!: EntityWith<RuntimeComponents, "rocket" | "rigidBody">
    private targetFlag!: EntityWith<RuntimeComponents, "level">
    private capturedCollector!: MessageCollector<LevelCapturedMessage>

    constructor(
        private world: WorldModel,
        private gamemode: string,
        private config: GameEnvironmentConfig,
        private rewardFactory: RewardFactory,
    ) {
        // features (4 bytes)
        // - velocity x
        // - velocity y
        // - rotation
        // - distance to flag x
        // - distance to flag y
        // - flag in capture
        this.observationFeatureBuffer = Buffer.alloc(4 * 6)

        // image (3 channels)
        this.observationImageBuffer = Buffer.alloc(config.width * config.height * 3)

        // source image has additionally alpha channel
        this.imageBuffer = Buffer.alloc(config.width * config.height * 4)

        const canvas = {
            width: config.width,
            height: config.height,
            addEventListener: () => {},
            removeEventListener: () => {},
        }

        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas as any,
            antialias: false,
            powerPreference: "high-performance",
            context: gl.default(config.width, config.height, {
                preserveDrawingBuffer: true,
            }),
            depth: false,
        })

        const renderTarget = new THREE.WebGLRenderTarget(config.width, config.height)
        this.renderer.setRenderTarget(renderTarget)

        this.reset()
    }

    reset(): [Buffer, Buffer] {
        this.runtime = newRuntime(RAPIER as any, this.world, this.gamemode)
        this.game = new GameAgentWrapper(this.runtime, new THREE.Scene() as any)
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
        const input = this.stepWithActionToInput(action.readInt8(0))

        const [reward, done] = this.reward.next(() => {
            for (let i = 0; i < this.config.stepsPerFrame; ++i) {
                this.game.step(input)
            }
        })

        this.renderer.render(this.game.sceneModule.getScene() as any, this.game.camera as any)

        this.extractPixelsToObservationBuffer()
        this.prepareFeatureBuffer()

        return [reward, done, this.observationImageBuffer, this.observationFeatureBuffer]
    }

    stepWithActionToInput(action: number): RuntimeSystemContext {
        switch (action) {
            case 0:
                return { thrust: false, rotation: this.rotation }
            case 1:
                this.rotation += 0.1
                return { thrust: false, rotation: this.rotation }
            case 2:
                this.rotation -= 0.1
                return { thrust: false, rotation: this.rotation }
            case 3:
                return { thrust: true, rotation: this.rotation }
            case 4:
                this.rotation += 0.1
                return { thrust: true, rotation: this.rotation }
            case 5:
                this.rotation -= 0.1
                return { thrust: true, rotation: this.rotation }
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
        for (let row = 0; row < this.config.height; row += 1) {
            for (let column = 0; column < this.config.width; column++) {
                const index = ((this.config.height - row - 1) * this.config.width + column) * 4
                const targetIndex = (row * this.config.width + column) * 3

                this.observationImageBuffer[targetIndex] = this.imageBuffer[index]
                this.observationImageBuffer[targetIndex + 1] = this.imageBuffer[index + 1]
                this.observationImageBuffer[targetIndex + 2] = this.imageBuffer[index + 2]
            }
        }
    }

    prepareFeatureBuffer() {
        for (const message of this.capturedCollector) {
            this.targetFlag = nextFlag(this.runtime, this.rocket)
        }

        const dx =
            this.rocket.components.rigidBody.translation().x -
            this.targetFlag.components.level.flag.x
        const dy =
            this.rocket.components.rigidBody.translation().y -
            this.targetFlag.components.level.flag.y

        const inCapture = this.targetFlag.components.level.inCapture

        this.observationFeatureBuffer.writeFloatLE(this.rocket.components.rigidBody.linvel().x, 0)
        this.observationFeatureBuffer.writeFloatLE(this.rocket.components.rigidBody.linvel().y, 4)
        this.observationFeatureBuffer.writeFloatLE(this.rotation, 8)
        this.observationFeatureBuffer.writeFloatLE(dx, 12)
        this.observationFeatureBuffer.writeFloatLE(dy, 16)
        this.observationFeatureBuffer.writeFloatLE(inCapture ? 1 : 0, 20)
    }
}

function nextFlag(runtime: Runtime, rocket: EntityWith<RuntimeComponents, "rocket" | "rigidBody">) {
    const distanceToFlag = (flagEntity: EntityWith<RuntimeComponents, "level">) => {
        const dx = rocket.components.rigidBody.translation().x - flagEntity.components.level.flag.x
        const dy = rocket.components.rigidBody.translation().y - flagEntity.components.level.flag.y
        return Math.sqrt(dx * dx + dy * dy)
    }

    const nextLevel = runtime.factoryContext.store
        .find("level")
        .filter(level => !level.components.level.captured)
        .map(level => [level, distanceToFlag(level)] as const)
        .reduce(([minLevel, minDistance], [level, distance]) =>
            distance < minDistance ? [level, distance] : [minLevel, minDistance],
        )[0]

    return nextLevel
}

global.navigator = { userAgent: "node" } as any

/*
const worldStr2 =
    "ClwKBkdsb2JhbBJSEigNzcxUwBXJdsBBJQAA7MEtAADKQTUAAO5BPQAAmMBFAAAAQE0AAABAGiYKJAAANEEAAEA/AAD/AODPAACAgP8AAABAxMDA/wDgTwC0////AAo1CgJGMRIvEi0NMzMbQBWLbFdAHdsPyUAlAADswS0AALhANQAA7kE9AACYwEUAAABATQAAAEAKEgoCRzESDAoKDWZmDsEVZmbEQQoSCgJHMhIMCgoNZmYKwRVmZsJBChIKAkczEgwKCg1mZma/FWZmwkEKEgoCRzQSDAoKDWZmRkAVZmbEQQo1CgJGMhIvEi0NzcwywRWLbFdAHdsPyUAlAACawS0AAMpBNQAAIEE9AACYwEUAAABATQAAAEASHAoITm9ybWFsIDESEAoCRzEKAkYxCgZHbG9iYWwSHAoITm9ybWFsIDISEAoCRzIKAkYxCgZHbG9iYWwSHAoITm9ybWFsIDMSEAoCRzMKAkYxCgZHbG9iYWwSHAoITm9ybWFsIDQSEAoCRzQKAkYxCgZHbG9iYWwSHAoITm9ybWFsIDUSEAoCRjIKAkcxCgZHbG9iYWwSHAoITm9ybWFsIDYSEAoCRjIKAkcyCgZHbG9iYWwSHAoITm9ybWFsIDcSEAoCRjIKAkczCgZHbG9iYWwSHAoITm9ybWFsIDgSEAoCRzQKAkYyCgZHbG9iYWw="
const worldStr =
    "CqAJCgZOb3JtYWwSlQkKDw0fhZ3BFR+FB0Id2w/JQBItDR+FtsEVgZUDQh3bD8lAJQAAEMItpHBhQjWuR9lBPR+Fm0FFAAAAQE0AAABAEi0Nrkc/QRVt5wZCHdsPyUAlAAD4QC2kcBZCNezRjUI94KMwP0UAAABATQAAAEASLQ2k8B5CFX9qWEEd2w/JQCUAAP5BLaRwFkI17NG9Qj3gozA/RQAAAEBNAAAAQBItDeyRm0IVPzWGQR3bD8lAJQCAjUItSOHsQTX26AVDPYTr6cBFAAAAQE0AAABAEi0Nw0XwQhUcd4lAHTMeejwlAIDnQi2kcA5CNfboMkM9EK6nv0UAAABATQAAAEASLQ2PYhxDFT813EEd2w/JQCUAAM9CLaRwbEI1AMAmQz0fhbFBRQAAAEBNAAAAQBItDcM15UIVYxBJQh3bD8lAJQAAeUItUrijQjXs0fpCPZDCM0JFAAAAQE0AAABAEi0N9WiFQhXVeIhCHdsPyUAlw7WBQi3sUY9CNcO1kUI9AACBQkUAAABATQAAAEAaTgpMpHA9wXE9ukHAwP8AAEAAPYCA/wAAtIBDAAD/AIDFAEBAQP8AgMgAAICA/wBAxgC+oKD/AABGAMf///8AV0dxQry8+QBSQPHA////ABpOCkyuR3FBSOHKQf/++ABAxgAA//3wAAA/QMT/++AAQEoAQv/3wAAAPkBF/++AAADHAD//3gAAgMYAAP/vgAAAAIDD////AKxGCq////8AGpcCCpQC9qjBQpqZJEL///8AMNEAOv///wDqy9pH////AOzHNML///8AAMIAx////wAAQkDE////AABFAL3///8AAELAx////wCARgBF////AEBGgMb///8AwEYAv////wAgSQBF////AOBIgMP///8A4EjAR////wAARYDE////AAC+oMj///8AAD8AAP///wAAAODK////AGBJAEf///8AwMTASP///wAgSQAA////AEBEwMb///8AAEOAQ////wBASQC/////AAA+wEj///8AwEqAw////wAAvMBL////AODIAAD///8AQMoAQP///wAAPgBI////ACDIAAD///8AgMCARv///wCAyQAA////AEBFgMb///8AGqcCCqQCpHAZQqRwOcH///8AmFgAwP///wCAxwhU////AGDK4E3///8AwM1gyf///wAAv+DI////AKBLAMP///8AADpgyf///wCARgAA////AAA6YMv///8AQMgAAP///wAAvuDJ////AIBFYMj///8AQMyAwf///wAAtMDG////AGDLAL3///8AOMAMSP///wAkxgCu////AADC4Mj///8AAMNARv///wBgyQAA////AEDHgMP///8AwMeAQf///wAAAEBM////ACDJAAD///8AgMMAx////wAAyoBC////AAC9AMb///8AgMTARf///wCAwIDB////AABFAML///8AAMgANP///wBAxEBG////AADHAAD///8AAMFAyP///wBgyEDE////ABomCiSPQopCcT2DQv/AjQAAxAAA/+R0AAAAAMT/kwAAAEQAAP+bAAASEgoGTm9ybWFsEggKBk5vcm1hbA=="
const worldStr3 =
    "CscCCgZOb3JtYWwSvAIKCg2F65XBFTXTGkISKA2kcLrBFZfjFkIlAAAAwi1SuIlCNa5H+UE9H4X/QUUAAABATQAAAEASKA1SuMFBFZmRGkIlhetRQS3NzFJCNSlcp0I9zcxEQUUAAABATQAAAEASKA0AgEVCFfIboEElAAAoQi0K189BNaRw4UI9rkdZwUUAAABATQAAAEASKA171MBCFcubHcElmpm5Qi0K189BNY/CI0M9rkdZwUUAAABATQAAAEASLQ1syOFCFToytkEdVGuzOiWamblCLSlcZUI1XI8jQz3NzIhBRQAAAEBNAAAAQBItDR/lAUMVk9VNQh2fUDa1JaRw9UItexRsQjWF60FDPQAAlEFFAAAAQE0AAABAEigNw1UzQxVpqkFCJdejJEMtBW94QjXXo0JDPQVvAEJFAAAAQE0AAABACu4KCg1Ob3JtYWwgU2hhcGVzEtwKGt8GCtwGP4UAws3MNEGgEEAAZjYAAP///wB1PAAU////AF5PABT///8AyUtPxP///wAzSg3L////AMBJAcj///8AE0Umzf///wCMVAo5////AJNRpDr///8AVE0WVP///wD0vlZLAAD/AEPI7Bn///8AhcPlOAAA/wAFQZrF////ADS9F8f///8AJMIuwf///wC5xvvF////AOrJ1rf///8Ac8ikQP///wBAxfRF////AGkxi0n///8Aj0LxQgAA/wB1xWY9////AJ/HZAlQUP4AzcUBvQAA/wDwQFzE////ADDGR73///8As8eZPoiI8QBxxWQ3rKz/AFw3LMQAAP8AwkNRtP///wC2RKO4////AEhBe8EAAP8AS0WPPP///wAdSaSx////AMw/Ucj///8A7MBNxv///wDmxnG9////AELCFLr///8Aw8UOof///wAKxCg4AAD/ALg8OMDZ2fsA4j9NwP///wCkxB+/AADwAHGwrr54ePgAVERcwv///wAPwXbA////APW0H0EAAPgASLtnv////wALM67DJSX/AFJApL////8AZj4uwP///wBcu+HATU3/AIU7+8H///8AXMK8Lf///wB7wjM/AAD4AHDCx8D///8AFEH7wP///wAAvnvE////AOTGChL///8A6bncRP///wCAQddAAAD4AB/AxLH///8AIL9RPQAA+ACZwqvG////AOLCLkQAAPgAIcTrwP///wDtwQPH////AOLJbqz///8ALsR6QwAA+AD+x8zA////APtF90kyMv8AH7mZQCcn/wCNxHo8tbX/AIDAiETKyv8AXEAgSgAA+AClyAqS////AH9EG0n///8AS0ypRP///wAxSIK7MDToANjBdUf///8A58yjxP///wCByD1EMDToAIzCYMv///8AnMq3MzA06AC+QenF////ANzGT0T///8AtMFSR////wBzRb85lpj/AFJALEQwNOgAqMIpPjA06AAgyiCF////AAPEE77///8AzT4FSnN1/wAzxWFCMDToAA23PcKXl/8AGcLmQDA06ADMPUnJu77/AFrGxsL///8A1TRGSjA06ACKwik8MDToAE3Apcn///8Ar8SawP///wBsygqP////ABHI8z0wNOgAAABTzv///wAa9wMK9APNzJNCj8JlQP///wBmtly8////ABa2jsg2Nv8AO0SENwAA+ACkvrtEvLz/AG0uOEX///8A4UaHPv///wA+QlXFAAD4AApB2L4AAPgAeDLVRP///wATSHHAAAD4ADhA3EP///8As0MKvAAA8ADOPxM4AAD4AEjBTUD///8Arj5TP3B0+ACyKw9DaGz4ALm6eDz///8AKT4MSP///wDhPy5CAAD/APS/XEL///8A+EV6PwAA/wAdsXtBp6f/AGzEpEEAAP8AisfEuf///wDXwVJI////AJpEaUf///8AhUfxQP///wB7RA3FAAD/ANdBTzUAAP8AC8C9Rv///wBGQoVE////APRMpDz///8A7kS3yAAA/wDLR9HB////AFLHNscAAP8AR0HNwf///wDsvtLGAAD/AABE5kD///8AD0JIRv///wD0RNJA////AEVFqcD///8A3ESpwwAA/wAuwgtJ////AARBqEj///8ALUdbSf///wA01Hks////AHjCAL3///8AF8s5x////wC4vlPP////AME1O8f///8AhsIAPgAA+ABcxZXC7e3/AIrEpUMAAPgAjcbDxcvL/wBdQFzF////AEjI+8EAAOAAQ0GZvf///wAGN77AFRX/APlFXDz///8AikEzwkhI+ADcQmoy////AArNAgoHUmV2ZXJzZRLBAgoPDRydLkMVk5lFQh2z7Zk2EigNpHC6wRWX4xZCJQAAAMItAABMQjUAAEDBPR+F/0FFAAAAQE0AAABAEigNUrjBQRWZkRpCJR+FAMItZuaJQjUAAPpBPQAAAEJFAAAAQE0AAABAEigNAIBFQhXyG6BBJQAAUEEthetRQjWkcKdCPVK4TkFFAAAAQE0AAABAEigNe9TAQhXLmx3BJTQzKEItCtfPQTUeBeJCPa5HWcFFAAAAQE0AAABAEi0NbMjhQhU6MrZBHVRrszolmpm5Qi1SuNRBNVyPI0M9ZmZawUUAAABATQAAAEASLQ0f5QFDFZPVTUIdn1A2tSWk8LlCLXsUZUI1hSskQz0AAIZBRQAAAEBNAAAAQBIoDcNVM0MVaapBQiUAgPVCLQAAbEI1AABCQz0AAJRBRQAAAEBNAAAAQBIhCgZOb3JtYWwSFwoNTm9ybWFsIFNoYXBlcwoGTm9ybWFsEiMKB1JldmVyc2USGAoNTm9ybWFsIFNoYXBlcwoHUmV2ZXJzZQ=="

const world = WorldModel.decode(Buffer.from(worldStr, "base64"))

const env = new GameEnvironment(
    world,
    "Normal",
    {
        width: 64,
        height: 64,
        stepsPerFrame: 4,
    },
    game => new DefaultGameReward(game),
)

const png = new PNG({
    width: 64,
    height: 64,
})

for (let i = 0; i < 30; ++i) {
    const [r, , image] = env.step(Buffer.from([5]))
    console.log(r)
    png.data.set(image)
    fs.writeFileSync(
        `imgs/output${i}.png`,
        PNG.sync.write(png, { colorType: 2, inputHasAlpha: false }),
    )
}

fs.writeFileSync("output.png", PNG.sync.write(png, { colorType: 2, inputHasAlpha: false }))

process.exit(0)
*/
