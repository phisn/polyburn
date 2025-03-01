import RAPIER from "@dimforge/rapier2d"
import { Game, GameConfig } from "game/src/game"
import { Color, WebGLRenderer } from "three"
import { GameLoopRunnable } from "./game-player-loop"
import { GamePlayerStore } from "./model/store"
import { ModuleCamera } from "./modules/module-camera"
import { ModuleInput } from "./modules/module-input/module-input"
import { ModuleInterpolation } from "./modules/module-interpolation"
import { ModuleParticles } from "./modules/module-particles/module-particles"
import { ModuleSyncGame } from "./modules/module-sync-game"
import { ModuleUI } from "./modules/module-ui/module-ui"
import { ModuleVisual } from "./modules/module-visual/module-visual"

export interface GamePlayerConfig {
    gameConfig: GameConfig
}

export class GamePlayer implements GameLoopRunnable {
    public game: Game
    public store: GamePlayerStore

    private moduleCamera: ModuleCamera
    private moduleInput: ModuleInput
    private moduleInterpolation: ModuleInterpolation
    private moduleParticles: ModuleParticles
    private moduleSyncGame: ModuleSyncGame
    private moduleUI: ModuleUI
    private moduleVisual: ModuleVisual

    private reset = false

    constructor(config: GamePlayerConfig) {
        const renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
        })
        renderer.autoClear = false
        renderer.setClearColor(Color.NAMES["black"], 1)

        this.game = new Game(config.gameConfig, { rapier: RAPIER })

        this.store = new GamePlayerStore(config.gameConfig, renderer)
        this.store.resources.set("summary", {
            ticks: 0,
        })

        this.moduleCamera = new ModuleCamera(this.store)
        this.moduleInput = new ModuleInput(this.store)
        this.moduleInterpolation = new ModuleInterpolation(this.store)
        this.moduleParticles = new ModuleParticles(this.store)
        this.moduleSyncGame = new ModuleSyncGame(this.store, this.game.store.outputEvents)
        this.moduleUI = new ModuleUI(this.store)
        this.moduleVisual = new ModuleVisual(this.store)

        this.game.store.events.listen({
            death: () => {
                const summary = this.game.store.resources.get("summary")

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
        this.store.resources.get("summary").ticks = 0

        this.game.onReset()
        this.moduleSyncGame.onReset()

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
        this.moduleParticles.update(delta)
        // this.moduleVisual.onUpdate()

        this.render()

        this.moduleUI.onUpdate()
    }

    private tickGame() {
        this.store.resources.get("summary").ticks++

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
