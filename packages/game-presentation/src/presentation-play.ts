import { Game } from "game/src/game"
import { GameConfig } from "game/src/store"
import { Color, WebGLRenderer } from "three"
import { ModuleCamera } from "./modules/module-camera"
import { ModuleInput } from "./modules/module-input/module-input"
import { ModuleInterpolation } from "./modules/module-interpolation"
import { ModuleParticles } from "./modules/module-particles/module-particles"
import { ModuleUI } from "./modules/module-ui/module-ui"
import { ModuleVisual } from "./modules/module-visual/module-visual"
import { PresentationRunnable } from "./presentation-game-loop"
import { PresentationStore } from "./store"

export interface PresentationPlayConfig extends GameConfig {}

export class PresentationPlay implements PresentationRunnable {
    public game: Game
    public store: PresentationStore

    private moduleCamera: ModuleCamera
    private moduleInput: ModuleInput
    private moduleInterpolation: ModuleInterpolation
    private moduleParticles: ModuleParticles
    private moduleUI: ModuleUI
    private moduleVisual: ModuleVisual

    private reset = false

    constructor(config: PresentationPlayConfig) {
        const renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
        })
        renderer.autoClear = false
        renderer.setClearColor(Color.NAMES["black"], 1)

        this.store = new PresentationStore(config, renderer)
        this.game = new Game(this.store)

        this.moduleCamera = new ModuleCamera(this.store)
        this.moduleInput = new ModuleInput(this.store)
        this.moduleInterpolation = new ModuleInterpolation(this.store)
        this.moduleParticles = new ModuleParticles(this.store)
        this.moduleUI = new ModuleUI(this.store)
        this.moduleVisual = new ModuleVisual(this.store)

        this.store.events.listen({
            death: () => {
                const summary = this.store.resources.get("summary")

                if (summary.flags === 0) {
                    this.reset = true
                }
            },
        })

        this.onReset()
    }

    onDispose() {
        const renderer = this.store.resources.get("renderer")
        renderer.dispose()

        this.moduleInput.onDispose()
    }

    onReset() {
        this.game.onReset()

        this.moduleInterpolation.onReset()

        this.moduleCamera.onReset()
        this.moduleInput.onReset()
    }

    onFixedUpdate(last: boolean) {
        if (this.reset) {
            this.onReset()
            this.reset = false
        }

        this.moduleInput.onFixedUpdate()

        if (this.store.resources.get("inputCapture").started) {
            this.tickGame()
        }

        this.moduleInterpolation.onFixedUpdate(last)

        this.moduleUI.onFixedUpdate()
    }

    onUpdate(delta: number, overstep: number) {
        this.moduleInterpolation.onUpdate(overstep)

        this.moduleCamera.onUpdate(delta)
        this.moduleParticles.onUpdate(delta)

        this.render()

        this.moduleUI.onUpdate()
    }

    private tickGame() {
        const inputCapture = this.store.resources.get("inputCapture")
        this.game.onUpdate(inputCapture.currentInput)
    }

    private render() {
        const renderer = this.store.resources.get("renderer")
        const scene = this.store.resources.get("scene")

        renderer.clear()
        renderer.render(scene, this.moduleCamera)
    }
}
