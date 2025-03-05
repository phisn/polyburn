import { EntityStore, newEntityStore } from "game/src/framework/entity"
import { EventStore } from "game/src/framework/event"
import { ResourceStore } from "game/src/framework/resource"
import { createContext } from "react"
import { Scene, WebGLRenderer } from "three"
import { proxyMap } from "valtio/utils"
import { EditorComponents, EditorModel } from "./model"

export class EditorStore {
    public entities: EntityStore<EditorComponents>
    public events: EventStore<EditorEvents>
    public resources: ResourceStore<EditorResources>

    constructor() {
        this.entities = newEntityStore()
        this.events = new EventStore()

        this.resources = new ResourceStore({
            model: {
                entityBundles: proxyMap(),
                gamemodes: proxyMap(),
                groups: proxyMap(),
            },
            renderer: new WebGLRenderer(),
            scene: new Scene(),
        })
    }
}

export interface EditorEvents {}

export interface EditorResources {
    model: EditorModel
    renderer: WebGLRenderer
    scene: Scene
    undoRedo: UndoRedo
}

export interface UndoRedo {
    undo: (() => void)[]
    redo: (() => void)[]
}

export const EditorStoreContext = createContext<EditorStore | undefined>(undefined)
