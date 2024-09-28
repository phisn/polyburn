import * as RAPIER from "@dimforge/rapier2d"
import { EventStore } from "game/src/framework/event"
import { ResourceStore } from "game/src/framework/resource"
import { Game } from "game/src/game"
import { Scene, WebGLRenderer } from "three"
import { InputCaptureResource } from "../modules/module-input/module-input"
import { InterpolationResource } from "../modules/module-interpolation"
import { VisualsResource } from "../modules/module-visual/module-visual"
import { GameSettings } from "./settings"

export class GamePlayerStore {
    public events: EventStore<GamePlayerEvents>
    public game: Game
    public resources: ResourceStore<GamePlayerResources>

    constructor(
        public settings: GameSettings,
        renderer: WebGLRenderer,
    ) {
        this.events = new EventStore()
        this.game = new Game(settings, { rapier: RAPIER })
        this.resources = new ResourceStore({
            renderer,
            scene: new Scene(),
        })
    }
}

export interface GamePlayerResources {
    inputCapture: InputCaptureResource
    interpolation: InterpolationResource
    renderer: WebGLRenderer
    scene: Scene
    visuals: VisualsResource
}

export interface GamePlayerEvents {}
