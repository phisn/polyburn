import { ReplayModel } from "game/proto/replay"
import { GameConfig } from "game/src/game"
import { Color, WebGLRenderer } from "three"
import { GameLoopRunnable } from "./game-player-loop"
import { GamePlayerStore } from "./model/store"
import { ModuleCamera } from "./modules/module-camera"
import { ModuleInterpolation } from "./modules/module-interpolation"
import { ModuleLobby } from "./modules/module-lobby/module-lobby"
import { ModuleParticles } from "./modules/module-particles/module-particles"
import { ModuleUI } from "./modules/module-ui/module-ui"
import { ModuleVisual } from "./modules/module-visual/module-visual"

export interface ReplayPlayerConfig extends GameConfig {
    replay: ReplayModel
    worldname: string
}

export class ReplayPlayer implements GameLoopRunnable {
    public store: GamePlayerStore

    private moduleCamera: ModuleCamera
    private moduleInterpolation: ModuleInterpolation
    private moduleLobby?: ModuleLobby
    private moduleParticles: ModuleParticles
    private moduleUI: ModuleUI
    private moduleVisual: ModuleVisual

    constructor(config: ReplayPlayerConfig) {
        const renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
        })
        renderer.autoClear = false
        renderer.setClearColor(Color.NAMES["black"], 1)

        this.store = new GamePlayerStore(config, renderer)

        this.store.resources.set("replay", {
            currentFrame: 0,
            frames: config.replay.frames,
        })

        this.moduleCamera = new ModuleCamera(this.store)
        this.moduleInterpolation = new ModuleInterpolation(this.store)
        this.moduleParticles = new ModuleParticles(this.store)
        this.moduleUI = new ModuleUI(this.store)
        this.moduleVisual = new ModuleVisual(this.store)
    }

    onDispose() {
        const renderer = this.store.resources.get("renderer")
        renderer.dispose()

        this.moduleLobby?.onDispose()
    }

    onReset() {
        this.store.game.onReset()

        this.moduleCamera.onReset()
    }

    onFixedUpdate(last: boolean) {
        this.tickGame()

        this.moduleInterpolation.onFixedUpdate(last)

        this.moduleLobby?.onFixedUpdate()
        this.moduleUI.onFixedUpdate()
    }

    onUpdate(delta: number, overstep: number) {
        this.moduleInterpolation.onUpdate(overstep)

        this.moduleCamera.onUpdate(delta)
        this.moduleParticles.update(delta)
        this.moduleVisual.onUpdate()

        this.render()

        this.moduleUI.onUpdate()
    }

    private tickGame() {
        const replay = this.store.resources.get("replay")
        const replayFrame = replay.frames[replay.currentFrame]

        this.store.game.onUpdate(replayFrame)

        replay.currentFrame++
    }

    private render() {
        const renderer = this.store.resources.get("renderer")
        const scene = this.store.resources.get("scene")

        renderer.clear()
        renderer.render(scene, this.moduleCamera)
    }
}
