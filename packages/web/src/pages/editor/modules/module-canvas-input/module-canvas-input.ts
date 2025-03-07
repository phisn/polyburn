import { EditorStore } from "../../store/store"
import { CanvasEvent } from "../../views/canvas/canvas-event"
import { HandlerBackground } from "./handler-background"
import { HandlerObject } from "./handler-object"
import { HandlerShape } from "./handler-shape"
import { cursor } from "./util"

export class ModuleCanvasInput {
    private unsubscribe: (() => void)[]

    private handlerBackground: HandlerBackground
    private handlerObject: HandlerObject
    private handlerShape: HandlerShape

    constructor(private store: EditorStore) {
        this.unsubscribe = []

        this.handlerBackground = new HandlerBackground(store)
        this.handlerObject = new HandlerObject(store)
        this.handlerShape = new HandlerShape(store)

        this.unsubscribe.push(
            store.events.listen({
                canvas: this.handleEvent.bind(this),
            }),
        )
    }

    onDispose() {
        for (const unsubscribe of this.unsubscribe) {
            unsubscribe()
        }
    }

    private handleEvent(event: CanvasEvent) {
        cursor.default()

        this.handlerBackground.handleMoving(event)
        this.handlerObject.handleMoving(event)
        this.handlerShape.handleMoving(event)
        this.handlerShape.handleVertex(event)

        this.handlerObject.handleSelected(event)
        this.handlerShape.handleSelected(event)

        this.handlerObject.handleDefault(event)
        this.handlerShape.handleDefault(event)

        this.handlerBackground.handleDefault(event)
    }
}
