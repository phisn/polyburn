import { EventStore } from "game/src/framework/event"
import { GameConfig } from "game/src/store"
import { Color, WebGLRenderer } from "three"
import { GameLoopRunnable } from "./game-player-loop"
import { ModuleCamera } from "./modules/module-camera"
import { ModuleInterpolation } from "./modules/module-interpolation"
import { ModuleParticles } from "./modules/module-particles/module-particles"
import { ModuleSyncGame } from "./modules/module-sync-game"
import { ModuleUI } from "./modules/module-ui/module-ui"
import { ModuleVisual } from "./modules/module-visual/module-visual"
import { PresentationStore } from "./store"

export interface ReplayPlayerConfig extends GameConfig {
    replay: GameOutput
}

export class ReplayPlayer implements GameLoopRunnable {
    public store: PresentationStore

    private outputEvents: EventStore<GameOutputEvents>

    private moduleCamera: ModuleCamera
    private moduleInterpolation: ModuleInterpolation
    private moduleParticles: ModuleParticles
    private moduleSyncGame: ModuleSyncGame
    private moduleUI: ModuleUI
    private moduleVisual: ModuleVisual

    constructor(private config: ReplayPlayerConfig) {
        const renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
        })
        renderer.autoClear = false
        renderer.setClearColor(Color.NAMES["black"], 1)

        this.store = new PresentationStore(config, renderer)
        this.store.resources.set("summary", {
            ticks: 0,
        })

        this.outputEvents = new EventStore()

        /*
        this.store.resources.set("replay", {
            currentFrame: 0,
            frames: config.replay.frames,
        })
            */

        this.moduleCamera = new ModuleCamera(this.store)
        this.moduleInterpolation = new ModuleInterpolation(this.store)
        this.moduleParticles = new ModuleParticles(this.store)
        this.moduleSyncGame = new ModuleSyncGame(this.store, this.outputEvents)
        this.moduleUI = new ModuleUI(this.store)
        this.moduleVisual = new ModuleVisual(this.store)

        this.onReset()
    }

    onDispose() {
        const renderer = this.store.resources.get("renderer")
        renderer.dispose()
    }

    onReset() {
        // this.store.game.onReset()
        this.moduleSyncGame.onReset()
        this.moduleCamera.onReset()
    }

    onFixedUpdate(last: boolean) {
        this.tickGame()

        this.moduleInterpolation.onFixedUpdate(last)

        this.moduleUI.onFixedUpdate()
    }

    onUpdate(delta: number, overstep: number) {
        this.moduleInterpolation.onUpdate(overstep)

        this.moduleCamera.onUpdate(delta)
        this.moduleParticles.onUpdate(delta)
        // this.moduleVisual.onUpdate()

        this.render()

        this.moduleUI.onUpdate()
    }

    private tickGame() {
        const frame = this.config.replay.frames[this.store.resources.get("summary").ticks]

        for (const [key, value] of Object.entries(frame)) {
            this.outputEvents.invoke[key as keyof Partial<GameOutputEvents>]?.(value)
        }

        this.store.resources.get("summary").ticks++
    }

    private render() {
        const renderer = this.store.resources.get("renderer")
        const scene = this.store.resources.get("scene")

        renderer.clear()
        renderer.render(scene, this.moduleCamera)
    }
}
