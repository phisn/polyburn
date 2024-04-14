import { WorldModel } from "runtime/proto/world"
import * as THREE from "three"
import { WebGLRenderer } from "three"
import { Camera } from "./camera"
import { Input } from "./input/input"
import { Particles } from "./particles/particles"
import { ExtendedRuntime, newExtendedRuntime } from "./runtime-extension/new-extended-runtime"
import { GameScene } from "./scene/scene"

export interface GameHooks {
    onFinished(
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

export class Game {
    private input: Input

    private renderer: Renderer
    private camera: Camera
    private scene: GameScene
    private runtime: ExtendedRuntime
    private particles: Particles

    constructor(world: WorldModel, gamemode: string) {
        this.runtime = newExtendedRuntime(world, gamemode)
        this.scene = new GameScene(this.runtime)

        this.renderer = new Renderer()
        this.camera = new Camera(this.runtime, this.renderer)
        this.input = new Input()

        this.particles = new Particles(this.runtime, this.scene, this.input)

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
        this.particles.update(delta)
        this.scene.onUpdate(delta, overstep)
        this.camera.onUpdate(delta, overstep)

        this.renderer.render(this.scene, this.camera)
    }
}
