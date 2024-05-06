import RAPIER from "custom-rapier2d-node/rapier"
import * as fs from "fs"
import * as gl from "gl"
import { PNG } from "pngjs"
import { EntityWith } from "runtime-framework"
import { WorldModel } from "runtime/proto/world"
import { RuntimeComponents } from "runtime/src/core/runtime-components"
import { RuntimeSystemContext } from "runtime/src/core/runtime-system-stack"
import { Runtime, newRuntime } from "runtime/src/runtime"
import * as THREE from "three"
import { ModuleScene } from "./module-scene/module-scene"

export class GameWrapper {
    runtime: Runtime
    sceneModule: ModuleScene
    camera: THREE.OrthographicCamera

    private rocket: EntityWith<RuntimeComponents, "rigidBody">

    constructor() {
        const worldStr =
            "CscCCgZOb3JtYWwSvAIKCg2F65XBFTXTGkISKA2kcLrBFZfjFkIlAAAAwi1SuIlCNa5H+UE9H4X/QUUAAABATQAAAEASKA1SuMFBFZmRGkIlhetRQS3NzFJCNSlcp0I9zcxEQUUAAABATQAAAEASKA0AgEVCFfIboEElAAAoQi0K189BNaRw4UI9rkdZwUUAAABATQAAAEASKA171MBCFcubHcElmpm5Qi0K189BNY/CI0M9rkdZwUUAAABATQAAAEASLQ1syOFCFToytkEdVGuzOiWamblCLSlcZUI1XI8jQz3NzIhBRQAAAEBNAAAAQBItDR/lAUMVk9VNQh2fUDa1JaRw9UItexRsQjWF60FDPQAAlEFFAAAAQE0AAABAEigNw1UzQxVpqkFCJdejJEMtBW94QjXXo0JDPQVvAEJFAAAAQE0AAABACu4KCg1Ob3JtYWwgU2hhcGVzEtwKGt8GCtwGP4UAws3MNEGgEEAAZjYAAP///wB1PAAU////AF5PABT///8AyUtPxP///wAzSg3L////AMBJAcj///8AE0Umzf///wCMVAo5////AJNRpDr///8AVE0WVP///wD0vlZLAAD/AEPI7Bn///8AhcPlOAAA/wAFQZrF////ADS9F8f///8AJMIuwf///wC5xvvF////AOrJ1rf///8Ac8ikQP///wBAxfRF////AGkxi0n///8Aj0LxQgAA/wB1xWY9////AJ/HZAlQUP4AzcUBvQAA/wDwQFzE////ADDGR73///8As8eZPoiI8QBxxWQ3rKz/AFw3LMQAAP8AwkNRtP///wC2RKO4////AEhBe8EAAP8AS0WPPP///wAdSaSx////AMw/Ucj///8A7MBNxv///wDmxnG9////AELCFLr///8Aw8UOof///wAKxCg4AAD/ALg8OMDZ2fsA4j9NwP///wCkxB+/AADwAHGwrr54ePgAVERcwv///wAPwXbA////APW0H0EAAPgASLtnv////wALM67DJSX/AFJApL////8AZj4uwP///wBcu+HATU3/AIU7+8H///8AXMK8Lf///wB7wjM/AAD4AHDCx8D///8AFEH7wP///wAAvnvE////AOTGChL///8A6bncRP///wCAQddAAAD4AB/AxLH///8AIL9RPQAA+ACZwqvG////AOLCLkQAAPgAIcTrwP///wDtwQPH////AOLJbqz///8ALsR6QwAA+AD+x8zA////APtF90kyMv8AH7mZQCcn/wCNxHo8tbX/AIDAiETKyv8AXEAgSgAA+AClyAqS////AH9EG0n///8AS0ypRP///wAxSIK7MDToANjBdUf///8A58yjxP///wCByD1EMDToAIzCYMv///8AnMq3MzA06AC+QenF////ANzGT0T///8AtMFSR////wBzRb85lpj/AFJALEQwNOgAqMIpPjA06AAgyiCF////AAPEE77///8AzT4FSnN1/wAzxWFCMDToAA23PcKXl/8AGcLmQDA06ADMPUnJu77/AFrGxsL///8A1TRGSjA06ACKwik8MDToAE3Apcn///8Ar8SawP///wBsygqP////ABHI8z0wNOgAAABTzv///wAa9wMK9APNzJNCj8JlQP///wBmtly8////ABa2jsg2Nv8AO0SENwAA+ACkvrtEvLz/AG0uOEX///8A4UaHPv///wA+QlXFAAD4AApB2L4AAPgAeDLVRP///wATSHHAAAD4ADhA3EP///8As0MKvAAA8ADOPxM4AAD4AEjBTUD///8Arj5TP3B0+ACyKw9DaGz4ALm6eDz///8AKT4MSP///wDhPy5CAAD/APS/XEL///8A+EV6PwAA/wAdsXtBp6f/AGzEpEEAAP8AisfEuf///wDXwVJI////AJpEaUf///8AhUfxQP///wB7RA3FAAD/ANdBTzUAAP8AC8C9Rv///wBGQoVE////APRMpDz///8A7kS3yAAA/wDLR9HB////AFLHNscAAP8AR0HNwf///wDsvtLGAAD/AABE5kD///8AD0JIRv///wD0RNJA////AEVFqcD///8A3ESpwwAA/wAuwgtJ////AARBqEj///8ALUdbSf///wA01Hks////AHjCAL3///8AF8s5x////wC4vlPP////AME1O8f///8AhsIAPgAA+ABcxZXC7e3/AIrEpUMAAPgAjcbDxcvL/wBdQFzF////AEjI+8EAAOAAQ0GZvf///wAGN77AFRX/APlFXDz///8AikEzwkhI+ADcQmoy////AArNAgoHUmV2ZXJzZRLBAgoPDRydLkMVk5lFQh2z7Zk2EigNpHC6wRWX4xZCJQAAAMItAABMQjUAAEDBPR+F/0FFAAAAQE0AAABAEigNUrjBQRWZkRpCJR+FAMItZuaJQjUAAPpBPQAAAEJFAAAAQE0AAABAEigNAIBFQhXyG6BBJQAAUEEthetRQjWkcKdCPVK4TkFFAAAAQE0AAABAEigNe9TAQhXLmx3BJTQzKEItCtfPQTUeBeJCPa5HWcFFAAAAQE0AAABAEi0NbMjhQhU6MrZBHVRrszolmpm5Qi1SuNRBNVyPI0M9ZmZawUUAAABATQAAAEASLQ0f5QFDFZPVTUIdn1A2tSWk8LlCLXsUZUI1hSskQz0AAIZBRQAAAEBNAAAAQBIoDcNVM0MVaapBQiUAgPVCLQAAbEI1AABCQz0AAJRBRQAAAEBNAAAAQBIhCgZOb3JtYWwSFwoNTm9ybWFsIFNoYXBlcwoGTm9ybWFsEiMKB1JldmVyc2USGAoNTm9ybWFsIFNoYXBlcwoHUmV2ZXJzZQ=="

        const worldModel = WorldModel.decode(Buffer.from(worldStr, "base64"))

        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0)

        this.runtime = newRuntime(RAPIER as any, worldModel, "Normal")
        this.sceneModule = new ModuleScene(scene, this.runtime)

        this.camera = new THREE.OrthographicCamera(-16, 16, 16, -16, -1000, 1000)
        this.rocket = this.runtime.factoryContext.store.find("rocket", "rigidBody")[0]

        this.camera.position.set(
            this.rocket.components.rigidBody.translation().x,
            this.rocket.components.rigidBody.translation().y,
            10,
        )
    }

    step(context: RuntimeSystemContext) {
        this.runtime.step(context)

        this.sceneModule.onUpdate()

        this.camera.position.set(
            this.rocket.components.rigidBody.translation().x,
            this.rocket.components.rigidBody.translation().y,
            10,
        )
    }
}

const renderer = createRenderer({ width: 64, height: 64 })
renderer.render(scene, camera)

const pixels = extractPixels(renderer.getContext())

const png = new PNG({
    width: pixels.width,
    height: pixels.height,
})

png.data.set(pixels.pixels)
fs.writeFileSync("output.png", PNG.sync.write(png))

process.exit(0)

function createRenderer({ height, width }: { height: number; width: number }) {
    // THREE expects a canvas object to exist, but it doesn't actually have to work.
    const canvas = {
        width,
        height,
        addEventListener: () => {},
        removeEventListener: () => {},
    }

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas as any,
        antialias: false,
        powerPreference: "high-performance",
        context: gl.default(width, height, {
            preserveDrawingBuffer: true,
        }),
        depth: false,
    })

    // This is important to enable shadow mapping. For more see:
    // https://threejsfundamentals.org/threejs/lessons/threejs-rendertargets.html and
    // https://threejsfundamentals.org/threejs/lessons/threejs-shadows.html
    const renderTarget = new THREE.WebGLRenderTarget(width, height)
    renderer.setRenderTarget(renderTarget)

    return renderer
}

function extractPixels(context: WebGLRenderingContext) {
    const width = context.drawingBufferWidth
    const height = context.drawingBufferHeight
    const frameBufferPixels = new Uint8Array(width * height * 4)
    context.readPixels(0, 0, width, height, context.RGBA, context.UNSIGNED_BYTE, frameBufferPixels)
    // The framebuffer coordinate space has (0, 0) in the bottom left, whereas images usually
    // have (0, 0) at the top left. Vertical flipping follows:
    const pixels = new Uint8Array(width * height * 4)
    for (let fbRow = 0; fbRow < height; fbRow += 1) {
        const rowData = frameBufferPixels.subarray(fbRow * width * 4, (fbRow + 1) * width * 4)
        const imgRow = height - fbRow - 1
        pixels.set(rowData, imgRow * width * 4)
    }
    return { width, height, pixels }
}
