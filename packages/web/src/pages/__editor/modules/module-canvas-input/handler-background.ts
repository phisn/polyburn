import { Point } from "game/src/model/utils"
import { EditorStore } from "../../store/store"
import { CanvasEvent } from "../../views/canvas/canvas-event"

export class HandlerBackground {
    private state:
        | {
              type: "default"
          }
        | {
              type: "moving"
              offsetPosition: Point
              startPosition: Point
          }

    constructor(private store: EditorStore) {
        this.state = {
            type: "default",
        }
    }

    handleDefault(event: CanvasEvent) {
        if (event.consumed || this.state.type !== "default") {
            return
        }

        if (event.leftButtonClicked) {
            const camera = this.store.resources.get("camera")

            this.state = {
                type: "moving",

                offsetPosition: {
                    x: camera.position.x + event.positionInWindow.x / camera.zoom,
                    y: camera.position.y - event.positionInWindow.y / camera.zoom,
                },

                startPosition: {
                    x: camera.position.x,
                    y: camera.position.y,
                },
            }

            event.consumed = true
        }
    }

    handleMoving(event: CanvasEvent) {
        if (event.consumed || this.state.type !== "moving") {
            return
        }

        const camera = this.store.resources.get("camera")
        const focus = this.store.resources.get("focus")

        if (event.leftButtonDown) {
            camera.position.set(
                this.state.offsetPosition.x - event.positionInWindow.x / camera.zoom,
                this.state.offsetPosition.y + event.positionInWindow.y / camera.zoom,
                camera.position.z,
            )

            camera.updateProjectionMatrix()

            event.consumed = true
        } else {
            if (
                Math.abs(this.state.startPosition.x - camera.position.x) < 0.01 &&
                Math.abs(this.state.startPosition.y - camera.position.y) < 0.01
            ) {
                if (focus.bundlesSelected.size > 0) {
                    console.log("clear")
                    focus.bundlesSelected.clear()
                }
            }

            this.state = { type: "default" }
        }
    }
}
