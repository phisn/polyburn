import * as RAPIER from "@dimforge/rapier2d"
import { Game } from "game/src/game"
import { Scene, WebGLRenderer } from "three"
import { InterpolationStore } from "./interpolation"
import { GameSettings } from "./settings"

export class WebGameStore {
    public game: Game
    public interpolation: InterpolationStore
    public renderer: WebGLRenderer
    public scene: Scene

    constructor(
        public settings: GameSettings,
        renderer: WebGLRenderer,
    ) {
        this.game = new Game(settings, { rapier: RAPIER })
        this.interpolation = new InterpolationStore(this.game)
        this.renderer = renderer
        this.scene = new Scene()
    }
}
