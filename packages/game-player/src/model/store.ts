import { EntityStore, EntityWith, newEntityStore } from "game/src/framework/entity"
import { EventStore } from "game/src/framework/event"
import { ResourceStore } from "game/src/framework/resource"
import { GameConfig } from "game/src/game"
import { Point } from "game/src/model/utils"
import { LobbyUserDTO } from "shared/src/lobby-api/lobby-api"
import { Scene, WebGLRenderer } from "three"
import { InputCaptureResource } from "../modules/module-input/module-input"
import { GamePlayerComponents } from "./entity"

export class GamePlayerStore {
    public events: EventStore<GamePlayerEvents>
    public entities: EntityStore<GamePlayerComponents>
    public resources: ResourceStore<GamePlayerResources>

    constructor(config: GameConfig, renderer: WebGLRenderer) {
        this.events = new EventStore()
        this.entities = newEntityStore()

        this.resources = new ResourceStore({
            renderer,
            scene: new Scene(),
        })

        this.resources.set("config", config)
    }
}

export interface GamePlayerResources {
    config: GameConfig
    inputCapture: InputCaptureResource
    renderer: WebGLRenderer
    scene: Scene
    summary: SummaryResource
}

export interface SummaryResource {
    ticks: number
}

export interface GamePlayerEvents {
    captureChanged(props: {
        level: EntityWith<GamePlayerComponents, "level">
        started: boolean
    }): void
    captured(props: { level: EntityWith<GamePlayerComponents, "level"> }): void
    death(props: { contactPoint: Point; normal: Point }): void

    lobbyConnected(otherUsers: LobbyUserDTO[]): void
    lobbyDisconnected(): void
    lobbyJoin(otherUser: LobbyUserDTO): void
    lobbyLeave(otherUser: LobbyUserDTO): void
}
