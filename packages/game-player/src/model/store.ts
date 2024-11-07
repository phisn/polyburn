import * as RAPIER from "@dimforge/rapier2d"
import { EventStore } from "game/src/framework/event"
import { ResourceStore } from "game/src/framework/resource"
import { Game } from "game/src/game"
import { LobbyUserDTO } from "shared/src/lobby-api/lobby-api"
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

    constructor(config: GamePlayerConfig, renderer: WebGLRenderer) {
        this.events = new EventStore()
        this.game = new Game(config, { rapier: RAPIER })
        this.resources = new ResourceStore({
            renderer,
            scene: new Scene(),
        })

        this.resources.set("config", config)
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
    lobbyConnected(otherUsers: LobbyUserDTO[]): void
    lobbyDisconnected(): void
    lobbyJoin(otherUser: LobbyUserDTO): void
    lobbyLeave(otherUser: LobbyUserDTO): void
}
