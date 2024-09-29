import * as RAPIER from "@dimforge/rapier2d"
import { EventStore } from "game/src/framework/event"
import { ResourceStore } from "game/src/framework/resource"
import { Game, GameConfig } from "game/src/game"
import { OtherUser } from "shared/src/lobby-api/other-user"
import { Scene, WebGLRenderer } from "three"
import { GamePlayerConfig } from "../game-player"
import { InputCaptureResource } from "../modules/module-input/module-input"
import { InterpolationResource } from "../modules/module-interpolation"
import { LobbyConfigResource } from "../modules/module-lobby/module-lobby"
import { VisualsResource } from "../modules/module-visual/module-visual"

export class GamePlayerStore {
    public events: EventStore<GamePlayerEvents>
    public game: Game
    public resources: ResourceStore<GamePlayerResources>

    constructor(config: GameConfig, renderer: WebGLRenderer) {
        this.events = new EventStore()
        this.game = new Game(config, { rapier: RAPIER })
        this.resources = new ResourceStore({
            renderer,
            scene: new Scene(),
        })
    }
}

export interface GamePlayerResources {
    config: GamePlayerConfig
    inputCapture: InputCaptureResource
    interpolation: InterpolationResource
    lobbyConfig: LobbyConfigResource
    renderer: WebGLRenderer
    scene: Scene
    visuals: VisualsResource
}

export interface GamePlayerEvents {
    lobbyConnected(otherUsers: OtherUser[]): void
    lobbyDisconnected(): void
    lobbyJoin(otherUser: OtherUser): void
    lobbyLeave(otherUser: OtherUser): void
}
