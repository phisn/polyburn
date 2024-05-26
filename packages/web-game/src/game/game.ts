import { Color, Scene, WebGLRenderer } from "three"
import { GameSettings } from "./game-settings"
import { ModuleCamera } from "./modules/module-camera"
import { ModuleHookHandler } from "./modules/module-hook-handler"
import { ModuleInput } from "./modules/module-input/module-input"
import { ModuleLobby } from "./modules/module-lobby/module-lobby"
import { ModuleParticles } from "./modules/module-particles/module-particles"
import { ModuleScene } from "./modules/module-scene/module-scene"
import { ExtendedRuntime, newExtendedRuntime } from "./runtime-extension/new-extended-runtime"

export interface GameInterface {
    dispose(): void

    onPreFixedUpdate(delta: number): void
    onFixedUpdate(last: boolean): void
    onUpdate(delta: number, overstep: number): void
}

export class Game implements GameInterface {
    runtime: ExtendedRuntime

    camera: ModuleCamera
    hooks: ModuleHookHandler
    input: ModuleInput
    particles: ModuleParticles
    scene: ModuleScene
    lobby?: ModuleLobby

    constructor(settings: GameSettings) {
        const scene = new Scene()

        const renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
        })

        renderer.setClearColor(Color.NAMES["black"], 1)

        this.runtime = newExtendedRuntime(settings, scene, renderer)

        this.camera = new ModuleCamera(this.runtime)
        this.hooks = new ModuleHookHandler(this.runtime)
        this.input = new ModuleInput(this.runtime)
        this.particles = new ModuleParticles(this.runtime)
        this.scene = new ModuleScene(this.runtime)

        if (settings.instanceType === "play" && settings.lobby) {
            this.lobby = new ModuleLobby(this.runtime)
        }

        this.onCanvasResize = this.onCanvasResize.bind(this)
        const observer = new ResizeObserver(this.onCanvasResize)
        observer.observe(renderer.domElement)
    }

    dispose() {
        this.input.dispose()
        this.runtime.factoryContext.renderer.dispose()
        this.lobby?.dispose()
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
        this.input.onFixedUpdate()

        const context = {
            thrust: this.input.thrust(),
            rotation: this.input.rotation(),
        }

        const rotationWithError = this.runtime.factoryContext.replayCapture.captureFrame(context)
        context.rotation = rotationWithError

        this.runtime.step(context)

        this.lobby?.onFixedUpdate()

        if (last) {
            this.camera.onFixedUpdate()
        }
    }

    onUpdate(delta: number, overstep: number) {
        this.particles.update(delta)
        this.scene.onUpdate(delta, overstep)
        this.lobby?.onUpdate(overstep)
        this.camera.onUpdate(delta)

        this.runtime.factoryContext.renderer.render(this.runtime.factoryContext.scene, this.camera)
    }

    domElement() {
        return this.runtime.factoryContext.renderer.domElement
    }
}
