import { EntityWith } from "runtime-framework"
import { EntityType, WorldModel } from "runtime/proto/world"
import { RocketEntityComponents } from "runtime/src/core/rocket/rocket-entity"
import { entityRegistry } from "runtime/src/model/world/entity-registry"
import * as THREE from "three"
import { WebGLRenderer } from "three"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js"
import { Camera } from "./game/camera"
import { Input } from "./game/input"
import { Particles } from "./game/particles"
import { MutatableShapeGeometry } from "./mutatable-shape-geometry"
import { ExtendedComponents } from "./runtime-extension/components"
import { ExtendedRuntime, newExtendedRuntime } from "./runtime-extension/new-extended-runtime"

function defaultRuntime() {
    function base64ToBytes(base64: string) {
        return Uint8Array.from(atob(base64), c => c.charCodeAt(0))
    }

    const world =
        "CscCCgZOb3JtYWwSvAIKCg2F65XBFTXTGkISKA2kcLrBFZfjFkIlAAAAwi1SuIlCNa5H+UE9H4X/QUUAAABATQAAAEASKA1SuMFBFZmRGkIlhetRQS3NzFJCNSlcp0I9zcxEQUUAAABATQAAAEASKA0AgEVCFfIboEElAAAoQi0K189BNaRw4UI9rkdZwUUAAABATQAAAEASKA171MBCFcubHcElmpm5Qi0K189BNY/CI0M9rkdZwUUAAABATQAAAEASLQ1syOFCFToytkEdVGuzOiWamblCLSlcZUI1XI8jQz3NzIhBRQAAAEBNAAAAQBItDR/lAUMVk9VNQh2fUDa1JaRw9UItexRsQjWF60FDPQAAlEFFAAAAQE0AAABAEigNw1UzQxVpqkFCJdejJEMtBW94QjXXo0JDPQVvAEJFAAAAQE0AAABACu4KCg1Ob3JtYWwgU2hhcGVzEtwKGt8GCtwGP4UAws3MNEGgEEAAZjYAAP///wB1PAAU////AF5PABT///8AyUtPxP///wAzSg3L////AMBJAcj///8AE0Umzf///wCMVAo5////AJNRpDr///8AVE0WVP///wD0vlZLAAD/AEPI7Bn///8AhcPlOAAA/wAFQZrF////ADS9F8f///8AJMIuwf///wC5xvvF////AOrJ1rf///8Ac8ikQP///wBAxfRF////AGkxi0n///8Aj0LxQgAA/wB1xWY9////AJ/HZAlQUP4AzcUBvQAA/wDwQFzE////ADDGR73///8As8eZPoiI8QBxxWQ3rKz/AFw3LMQAAP8AwkNRtP///wC2RKO4////AEhBe8EAAP8AS0WPPP///wAdSaSx////AMw/Ucj///8A7MBNxv///wDmxnG9////AELCFLr///8Aw8UOof///wAKxCg4AAD/ALg8OMDZ2fsA4j9NwP///wCkxB+/AADwAHGwrr54ePgAVERcwv///wAPwXbA////APW0H0EAAPgASLtnv////wALM67DJSX/AFJApL////8AZj4uwP///wBcu+HATU3/AIU7+8H///8AXMK8Lf///wB7wjM/AAD4AHDCx8D///8AFEH7wP///wAAvnvE////AOTGChL///8A6bncRP///wCAQddAAAD4AB/AxLH///8AIL9RPQAA+ACZwqvG////AOLCLkQAAPgAIcTrwP///wDtwQPH////AOLJbqz///8ALsR6QwAA+AD+x8zA////APtF90kyMv8AH7mZQCcn/wCNxHo8tbX/AIDAiETKyv8AXEAgSgAA+AClyAqS////AH9EG0n///8AS0ypRP///wAxSIK7MDToANjBdUf///8A58yjxP///wCByD1EMDToAIzCYMv///8AnMq3MzA06AC+QenF////ANzGT0T///8AtMFSR////wBzRb85lpj/AFJALEQwNOgAqMIpPjA06AAgyiCF////AAPEE77///8AzT4FSnN1/wAzxWFCMDToAA23PcKXl/8AGcLmQDA06ADMPUnJu77/AFrGxsL///8A1TRGSjA06ACKwik8MDToAE3Apcn///8Ar8SawP///wBsygqP////ABHI8z0wNOgAAABTzv///wAa9wMK9APNzJNCj8JlQP///wBmtly8////ABa2jsg2Nv8AO0SENwAA+ACkvrtEvLz/AG0uOEX///8A4UaHPv///wA+QlXFAAD4AApB2L4AAPgAeDLVRP///wATSHHAAAD4ADhA3EP///8As0MKvAAA8ADOPxM4AAD4AEjBTUD///8Arj5TP3B0+ACyKw9DaGz4ALm6eDz///8AKT4MSP///wDhPy5CAAD/APS/XEL///8A+EV6PwAA/wAdsXtBp6f/AGzEpEEAAP8AisfEuf///wDXwVJI////AJpEaUf///8AhUfxQP///wB7RA3FAAD/ANdBTzUAAP8AC8C9Rv///wBGQoVE////APRMpDz///8A7kS3yAAA/wDLR9HB////AFLHNscAAP8AR0HNwf///wDsvtLGAAD/AABE5kD///8AD0JIRv///wD0RNJA////AEVFqcD///8A3ESpwwAA/wAuwgtJ////AARBqEj///8ALUdbSf///wA01Hks////AHjCAL3///8AF8s5x////wC4vlPP////AME1O8f///8AhsIAPgAA+ABcxZXC7e3/AIrEpUMAAPgAjcbDxcvL/wBdQFzF////AEjI+8EAAOAAQ0GZvf///wAGN77AFRX/APlFXDz///8AikEzwkhI+ADcQmoy////AArNAgoHUmV2ZXJzZRLBAgoPDRydLkMVk5lFQh2z7Zk2EigNpHC6wRWX4xZCJQAAAMItAABMQjUAAEDBPR+F/0FFAAAAQE0AAABAEigNUrjBQRWZkRpCJR+FAMItZuaJQjUAAPpBPQAAAEJFAAAAQE0AAABAEigNAIBFQhXyG6BBJQAAUEEthetRQjWkcKdCPVK4TkFFAAAAQE0AAABAEigNe9TAQhXLmx3BJTQzKEItCtfPQTUeBeJCPa5HWcFFAAAAQE0AAABAEi0NbMjhQhU6MrZBHVRrszolmpm5Qi1SuNRBNVyPI0M9ZmZawUUAAABATQAAAEASLQ0f5QFDFZPVTUIdn1A2tSWk8LlCLXsUZUI1hSskQz0AAIZBRQAAAEBNAAAAQBIoDcNVM0MVaapBQiUAgPVCLQAAbEI1AABCQz0AAJRBRQAAAEBNAAAAQBIhCgZOb3JtYWwSFwoNTm9ybWFsIFNoYXBlcwoGTm9ybWFsEiMKB1JldmVyc2USGAoNTm9ybWFsIFNoYXBlcwoHUmV2ZXJzZQ=="
    const worldModel = WorldModel.decode(base64ToBytes(world))

    return newExtendedRuntime(worldModel, "Normal")
}

class Renderer extends WebGLRenderer {
    constructor() {
        const canvas = document.querySelector(`canvas#scene`) as HTMLCanvasElement
        super({ canvas, antialias: true, alpha: true })

        this.setClearColor(THREE.Color.NAMES["black"], 1)
    }

    onCanvasResize(width: number, height: number) {
        this.setSize(width, height, false)
    }
}

class GameLoop {
    private animationFrame: number | undefined
    private previous_time: DOMHighResTimeStamp | undefined
    private loop_time = 0

    private tickrate = 1000 / 60

    constructor(private game: Game) {
        this.tick = this.tick.bind(this)
    }

    public start() {
        this.animationFrame = requestAnimationFrame(this.tick)
    }

    public stop() {
        if (this.animationFrame !== undefined) {
            cancelAnimationFrame(this.animationFrame)
            this.animationFrame = undefined
        }
    }

    private tick(time: DOMHighResTimeStamp) {
        this.animationFrame = requestAnimationFrame(this.tick)

        if (this.previous_time === undefined) {
            this.previous_time = time
        }

        const delta = time - this.previous_time!
        this.loop_time += delta
        this.previous_time = time

        this.game.onPreFixedUpdate(delta)

        while (this.loop_time > this.tickrate) {
            this.loop_time -= this.tickrate
            this.game.onFixedUpdate(this.loop_time <= this.tickrate)
        }

        // console.log("delta: ", delta, "overstep: ", this.loop_time / this.tickrate)

        this.game.onUpdate(delta, this.loop_time / this.tickrate)
    }
}

class EntityInterpolation {
    private previousX: number
    private previousY: number
    private previousRotation: number

    constructor(
        private entity: EntityWith<ExtendedComponents, "rigidBody" | "interpolation">,
        private object: THREE.Object3D,
    ) {
        const translation = entity.components.rigidBody.translation()
        this.previousX = translation.x
        this.previousY = translation.y
        this.previousRotation = entity.components.rigidBody.rotation()
    }

    onUpdate(delta: number, overstep: number) {
        const translation = this.entity.components.rigidBody.translation()
        const rotation = this.entity.components.rigidBody.rotation()

        this.object.position.x = this.lerp(this.previousX, translation.x, overstep)
        this.object.position.y = this.lerp(this.previousY, translation.y, overstep)
        this.object.rotation.z = this.slerp(this.previousRotation, rotation, overstep)

        this.entity.components.interpolation.position.x = this.object.position.x
        this.entity.components.interpolation.position.y = this.object.position.y
        this.entity.components.interpolation.rotation = this.object.rotation.z
    }

    onLastFixedUpdate() {
        const translation = this.entity.components.rigidBody.translation()
        const rotation = this.entity.components.rigidBody.rotation()

        this.previousX = translation.x
        this.previousY = translation.y
        this.previousRotation = rotation
    }

    position() {
        return this.object.position
    }

    private lerp(previous: number, next: number, t: number) {
        return (1 - t) * previous + t * next
    }

    private slerp(previous: number, next: number, t: number) {
        const difference = next - previous
        const shortestAngle =
            (((difference % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI

        return previous + shortestAngle * t
    }
}

class GameScene extends THREE.Scene {
    private rocketInterpolation: EntityInterpolation

    constructor(private runtime: ExtendedRuntime) {
        super()

        const [rocket] = runtime.factoryContext.store.newSet(...RocketEntityComponents)

        const svgText =
            '<?xml version="1.0"?> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 600" height="600" width="300"><path fill="#FFF" opacity="1" d=" M 1 502 L 3 355 C 4 344 4 334 5 324 C 7 310 9 297 11 284 C 15 256 23 229 32 202 C 43 169 57 138 74 108 C 87 85 100 62 117 42 L 150 0 L 183 42 C 200 62 213 85 226 108 C 243 138 257 169 268 202 C 277 229 285 256 289 284 C 291 297 293 310 295 324 C 296 334 296 344 297 355 L 299 502 z"/><path fill="#FFF" opacity="1" d="M 300 600 L 190 502 L 299 502"/><path fill="#FFF" opacity="1" d="M 0 600 L 1 502 L 110 502"/></svg>'

        const svgLoader = new SVGLoader()
        const svg = svgLoader.parse(svgText)
        const svgGroup = new THREE.Group()

        for (const path of svg.paths) {
            const material = new THREE.MeshBasicMaterial({
                color: THREE.Color.NAMES["white"],
            })

            const shapes = SVGLoader.createShapes(path)

            for (const shape of shapes) {
                const geometry = new THREE.ShapeGeometry(shape)
                const mesh = new THREE.Mesh(geometry, material)

                console.log(mesh)
                svgGroup.add(mesh)
            }
        }

        const scale = (0.15 * 1) / 25.0
        const rocketEntry = entityRegistry[EntityType.ROCKET]

        svgGroup.scale.set(scale, scale, 1.0)
        svgGroup.rotation.set(0, 0, Math.PI)
        svgGroup.position.set(rocketEntry.width / 2, rocketEntry.height / 2, 1.0)

        const svgParent = new THREE.Object3D()
        svgParent.add(svgGroup)

        this.add(svgParent)

        this.rocketInterpolation = new EntityInterpolation(
            rocket.with({
                interpolation: {
                    position: { x: 0, y: 0 },
                    rotation: 0,
                },
            }),
            svgParent,
        )

        const shapes = runtime.factoryContext.store.newSet("shape")

        for (const shape of shapes) {
            const shapeGeometry = new MutatableShapeGeometry(
                shape.components.shape.vertices.map(vertex => ({
                    position: new THREE.Vector2(vertex.position.x, vertex.position.y),
                    color: vertex.color,
                })),
            )
            const shapeMaterial = new THREE.MeshBasicMaterial({ vertexColors: true })
            const shapeMesh = new THREE.Mesh(shapeGeometry, shapeMaterial)

            this.add(shapeMesh)
        }
    }

    onUpdate(delta: number, overstep: number) {
        this.rocketInterpolation.onUpdate(delta, overstep)
    }

    onFixedUpdate(last: boolean) {
        if (last) {
            this.rocketInterpolation.onLastFixedUpdate()
        }
    }
}

class Game {
    private input: Input

    private renderer: Renderer
    private camera: Camera
    private scene: GameScene
    private runtime: ExtendedRuntime
    private particles: Particles

    constructor() {
        this.runtime = defaultRuntime()
        this.scene = new GameScene(this.runtime)

        this.renderer = new Renderer()
        this.camera = new Camera(this.runtime, this.renderer)
        this.input = new Input()

        this.particles = new Particles(this.runtime, this.input)

        this.onCanvasResize = this.onCanvasResize.bind(this)
        const observer = new ResizeObserver(this.onCanvasResize)
        observer.observe(this.renderer.domElement)
    }

    dispose() {
        this.input.dispose()
        this.renderer.dispose()
    }

    private onCanvasResize() {
        const width = this.renderer.domElement.clientWidth
        const height = this.renderer.domElement.clientHeight

        this.renderer.onCanvasResize(width, height)
        this.camera.onCanvasResize(width, height)
    }

    onPreFixedUpdate(delta: number) {
        this.input.onPreFixedUpdate(delta)
    }

    onFixedUpdate(last: boolean) {
        this.scene.onFixedUpdate(last)

        this.runtime.step({
            thrust: this.input.thrust(),
            rotation: this.input.rotation(),
        })

        if (last) {
            this.camera.onFixedUpdate()
        }
    }

    onUpdate(delta: number, overstep: number) {
        this.scene.onUpdate(delta, overstep)
        this.camera.onUpdate(delta, overstep)

        this.renderer.render(this.scene, this.camera)
    }
}

const loop = new GameLoop(new Game())
loop.start()
