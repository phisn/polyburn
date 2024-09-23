import * as RAPIER from "@dimforge/rapier2d"
import { EventStore } from "game/src/framework/event"
import { ResourceStore } from "game/src/framework/resource"
import { Game } from "game/src/game"
import { Scene, WebGLRenderer } from "three"
import { InterpolationStore } from "./interpolation"
import { GameSettings } from "./settings"

export class GamePlayerStore {
    public interpolation: InterpolationStore
    public renderer: WebGLRenderer
    public scene: Scene

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

        this.interpolation = new InterpolationStore(this.game)
        this.scene = new Scene()
        this.renderer = renderer
    }
}

export interface GamePlayerResources {
    renderer: WebGLRenderer
    scene: Scene
    interpolation: InterpolationStore
}

export interface GamePlayerEvents {}
