import { EditorStore } from "../../store/store"
import { CanvasEvent } from "../../views/canvas/canvas-event"

export class HandlerShape {
    private state:
        | {
              type: "default"
          }
        | {
              type: "moving"
          }
        | {
              type: "selected"
          }
        | {
              type: "vertex"
          }

    constructor(private store: EditorStore) {
        this.state = {
            type: "default",
        }
    }

    handleDefault(_event: CanvasEvent) {}

    handleSelected(_event: CanvasEvent) {}

    handleMoving(_event: CanvasEvent) {}

    handleVertex(_event: CanvasEvent) {}
}
