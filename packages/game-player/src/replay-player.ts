import { ReplayModel } from "game/proto/replay"
import { GameConfig } from "game/src/game"
import { Color, WebGLRenderer } from "three"
import { GameLoopRunnable } from "./game-player-loop"
import { GamePlayerStore } from "./model/store"
import { ModuleCamera } from "./modules/module-camera"
import { ModuleInput } from "./modules/module-input/module-input"
import { ModuleInterpolation } from "./modules/module-interpolation"
import { LobbyConfigResource, ModuleLobby } from "./modules/module-lobby/module-lobby"
import { ModuleParticles } from "./modules/module-particles/module-particles"
import { ModuleReplay } from "./modules/module-replay"
import { ModuleUI } from "./modules/module-ui/module-ui"
import { ModuleVisual } from "./modules/module-visual/module-visual"

export interface ReplayPlayerConfig extends GameConfig {
    replay: ReplayModel
    worldname: string
}

export class ReplayPlayer implements GameLoopRunnable {
    public store: GamePlayerStore

    private moduleCamera: ModuleCamera
    private moduleInput: ModuleInput
    private moduleInterpolation: ModuleInterpolation
    private moduleLobby?: ModuleLobby
    private moduleParticles: ModuleParticles
    private moduleReplay: ModuleReplay
    private moduleUI: ModuleUI
    private moduleVisual: ModuleVisual

    constructor(config: ReplayPlayerConfig, lobbyConfig?: LobbyConfigResource) {
        const renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
        })
        renderer.autoClear = false
        renderer.setClearColor(Color.NAMES["black"], 1)

        this.store = new GamePlayerStore(config, renderer)

        this.store.resources.set("lobbyConfig", lobbyConfig)

        this.moduleCamera = new ModuleCamera(this.store)
        this.moduleInput = new ModuleInput(this.store)
        this.moduleInterpolation = new ModuleInterpolation(this.store)
        this.moduleParticles = new ModuleParticles(this.store)
        this.moduleReplay = new ModuleReplay(this.store)
        this.moduleUI = new ModuleUI(this.store)
        this.moduleVisual = new ModuleVisual(this.store)

        if (lobbyConfig) {
            this.moduleLobby = new ModuleLobby(this.store)
        }
    }

    onDispose() {
        const renderer = this.store.resources.get("renderer")
        renderer.dispose()

        // this.moduleInput.onDispose()
        this.moduleLobby?.onDispose()
    }

    onReset() {
        this.store.game.onReset()

        this.moduleCamera.onReset()
        this.moduleReplay.onReset()
    }

    onFixedUpdate(last: boolean) {
        this.store.resources.get("scene")

        this.tickGame()
        this.moduleInterpolation.onFixedUpdate(last)

        this.moduleLobby?.onFixedUpdate()
        this.moduleReplay.onFixedUpdate()
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
        const inputCapture = this.store.resources.get("inputCapture")
        this.store.game.onUpdate(inputCapture.currentInput)
    }

    private render() {
        const renderer = this.store.resources.get("renderer")
        const scene = this.store.resources.get("scene")

        renderer.clear()
        renderer.render(scene, this.moduleCamera)
    }
}
