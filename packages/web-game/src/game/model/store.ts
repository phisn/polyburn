import * as RAPIER from "@dimforge/rapier2d"
import { Game } from "game/src/game"
import { Scene, WebGLRenderer } from "three"
import { GameSettings } from "./settings"

export class WebGameStore {
    public game: Game
    public renderer: WebGLRenderer
    public scene: Scene

    constructor(settings: GameSettings, renderer: WebGLRenderer) {
        this.game = new Game(settings, { rapier: RAPIER })
        this.renderer = renderer
        this.scene = new Scene()
    }
}
