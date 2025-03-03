import RAPIER from "@dimforge/rapier2d"
import { EntityStore, newEntityStore } from "game/src/framework/entity"
import { EventStore } from "game/src/framework/event"
import { ResourceStore } from "game/src/framework/resource"
import { GameComponents, GameConfig, GameEvents, GameResources, GameStore } from "game/src/store"
import { LobbyUserDTO } from "shared/src/lobby-api/lobby-api"
import * as THREE from "three"
import { Scene, WebGLRenderer } from "three"
import { InputResource } from "./modules/module-input/module-input"
import { InterpolationComponent } from "./modules/module-interpolation"

export class PresentationStore implements GameStore {
    public entities: EntityStore<PresentationComponents>
    public events: EventStore<PresentationEvents>
    public resources: ResourceStore<PresentationResources>

    constructor(config: GameConfig, renderer: WebGLRenderer) {
        this.events = new EventStore()
        this.entities = newEntityStore()

        this.resources = new ResourceStore({
            config,
            rapier: RAPIER,
            renderer,
            scene: new Scene(),
        })
    }
}

export interface PresentationComponents extends GameComponents {
    interpolation: InterpolationComponent
    visual: THREE.Object3D
}

export interface PresentationEvents extends GameEvents<PresentationComponents> {
    lobbyConnected(otherUsers: LobbyUserDTO[]): void
    lobbyDisconnected(): void
    lobbyJoin(otherUser: LobbyUserDTO): void
    lobbyLeave(otherUser: LobbyUserDTO): void
}

export interface PresentationResources extends GameResources {
    inputCapture: InputResource
    renderer: WebGLRenderer
    scene: Scene
}
