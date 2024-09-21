import { ReplayCaptureService } from "game/src/model/replay/replay-capture-service"
import { Color, WebGLRenderer } from "three"
import { GameSettings } from "./model/settings"
import { WebGameStore } from "./model/store"
import { ModuleCamera } from "./modules/module-camera"
import { ModuleHookHandler } from "./modules/module-hook-handler"
import { ModuleInput } from "./modules/module-input/module-input"
import { ModuleLobby } from "./modules/module-lobby/module-lobby"
import { ModuleParticles } from "./modules/module-particles/module-particles"
import { ModuleUI } from "./modules/module-ui/module-ui"
import { ModuleVisual } from "./modules/module-visual/module-scene"

export interface GameInterface {
    dispose(): void

    onPreFixedUpdate(delta: number): void
    onFixedUpdate(last: boolean): void
    onUpdate(delta: number, overstep: number): void
}

export class WebGame implements GameInterface {
    store: WebGameStore

    replayCapture: ReplayCaptureService

    moduleCamera: ModuleCamera
    moduleHooks: ModuleHookHandler
    moduleInput: ModuleInput
    moduleLobby?: ModuleLobby
    moduleParticles: ModuleParticles
    moduleUI: ModuleUI
    moduleVisual: ModuleVisual

    constructor(settings: GameSettings) {
        const renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
        })

        renderer.autoClear = false
        renderer.setClearColor(Color.NAMES["black"], 1)

        this.store = new WebGameStore(settings, renderer)

        this.replayCapture = new ReplayCaptureService()

        this.moduleCamera = new ModuleCamera(this.store)
        this.moduleHooks = new ModuleHookHandler(this.store)
        this.moduleInput = new ModuleInput(this.store)
        this.moduleParticles = new ModuleParticles(this.store)
        this.moduleUI = new ModuleUI(this.store)
        this.moduleVisual = new ModuleVisual(this.store)

        if (settings.instanceType === "play" && settings.lobby) {
            this.moduleLobby = new ModuleLobby(this.store)
        }

        this.onCanvasResize = this.onCanvasResize.bind(this)
        const observer = new ResizeObserver(this.onCanvasResize)
        observer.observe(renderer.domElement)
    }

    dispose() {
        this.moduleInput.dispose()
        this.store.renderer.dispose()
        this.moduleLobby?.dispose()
    }

    private onCanvasResize() {
        const width = this.store.renderer.domElement.clientWidth
        const height = this.store.renderer.domElement.clientHeight

        this.moduleCamera.onCanvasResize(width, height)
    }

    onPreFixedUpdate(delta: number) {
        this.moduleInput.onPreFixedUpdate(delta)
    }

    onFixedUpdate(last: boolean) {
        this.moduleInput.onFixedUpdate()

        const input = {
            thrust: this.moduleInput.thrust(),
            rotation: this.moduleInput.rotation(),
        }

        const rotationWithError = this.replayCapture.captureFrame(input)
        input.rotation = rotationWithError

        this.store.game.onUpdate(input)

        if (last) {
            this.store.interpolation.onLastFixedUpdate()
        }

        this.moduleLobby?.onFixedUpdate()
        this.moduleUI.onFixedUpdate()
    }

    onUpdate(delta: number, overstep: number) {
        this.store.interpolation.onUpdate(delta, overstep)

        this.moduleParticles.update(delta)
        this.moduleVisual.onUpdate()
        this.moduleLobby?.onUpdate(overstep)
        this.moduleCamera.onUpdate(delta)

        this.store.renderer.clear()

        this.moduleCamera.updateViewport()
        this.store.renderer.render(this.store.scene, this.moduleCamera)
        this.moduleUI.onUpdate()
    }

    domElement() {
        return this.store.renderer.domElement
    }
}
