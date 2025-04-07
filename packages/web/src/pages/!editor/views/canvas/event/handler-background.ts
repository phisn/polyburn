import { Point } from "game/src/model/utils"
import { World } from "koota"
import { editorActions } from "../../../store/world"
import { Event, EventContext } from "./event"

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

    constructor(
        private context: EventContext,
        private world: World,
    ) {
        this.state = {
            type: "default",
        }
    }

    handleDefault(event: Event) {
        if (event.consumed || this.state.type !== "default") {
            return
        }

        editorActions(this.world).clearHighlights()

        if (event.leftButtonClicked) {
            const camera = this.context.camera

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

    handleMoving(event: Event) {
        if (event.consumed || this.state.type !== "moving") {
            return
        }

        const camera = this.context.camera

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
                editorActions(this.world).clearSelected()
            }

            this.state = { type: "default" }
        }
    }
}
