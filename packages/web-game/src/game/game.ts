import { WorldModel } from "runtime/proto/world"
import { Color, Scene, WebGLRenderer } from "three"
import { ModuleCamera } from "./modules/module-camera"
import { ModuleInput } from "./modules/module-input/module-input"
import { ModuleParticles } from "./modules/module-particles/module-particles"
import { ModuleScene } from "./modules/module-scene/module-scene"
import { ExtendedRuntime, newExtendedRuntime } from "./runtime-extension/new-extended-runtime"

export class Game {
    private runtime: ExtendedRuntime

    private camera: ModuleCamera
    private input: ModuleInput
    private particles: ModuleParticles
    private scene: ModuleScene

    constructor(world: WorldModel, gamemode: string) {
        const scene = new Scene()

        const canvas = document.querySelector(`canvas#scene`) as HTMLCanvasElement
        const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
        renderer.setClearColor(Color.NAMES["black"], 1)

        this.runtime = newExtendedRuntime(scene, renderer, world, gamemode)

        this.scene = new ModuleScene(this.runtime)
        this.camera = new ModuleCamera(this.runtime)
        this.input = new ModuleInput(this.runtime)
        this.particles = new ModuleParticles(this.runtime)

        this.onCanvasResize = this.onCanvasResize.bind(this)
        const observer = new ResizeObserver(this.onCanvasResize)
        observer.observe(renderer.domElement)
    }

    dispose() {
        this.input.dispose()
        this.runtime.factoryContext.renderer.dispose()
    }

    private onCanvasResize() {
        const width = this.runtime.factoryContext.renderer.domElement.clientWidth
        const height = this.runtime.factoryContext.renderer.domElement.clientHeight

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
        this.camera.onUpdate(delta)

        this.runtime.factoryContext.renderer.render(this.runtime.factoryContext.scene, this.camera)
    }
}
