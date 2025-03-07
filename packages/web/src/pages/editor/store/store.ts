import { EntityStore, newEntityStore } from "game/src/framework/entity"
import { EventStore } from "game/src/framework/event"
import { ResourceStore } from "game/src/framework/resource"
import { createContext } from "react"
import { OrthographicCamera, Scene, WebGLRenderer } from "three"
import { CanvasEvent } from "../views/canvas/canvas-event"
import { EditorComponents, EditorModel } from "./model"

export class EditorStore {
    public entities: EntityStore<EditorComponents>
    public events: EventStore<EditorEvents>
    public resources: ResourceStore<EditorResources>

    constructor() {
        this.entities = newEntityStore()
        this.events = new EventStore()
        this.resources = new ResourceStore()
    }
}

export interface EditorEvents {
    canvas(event: CanvasEvent): void
    mutation(undo: () => void, redo: () => void): void
}

export interface EditorResources {
    camera: OrthographicCamera
    focus: {
        bundlesHighlighted: Set<number>
        bundlesSelected: Set<number>
    }
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
