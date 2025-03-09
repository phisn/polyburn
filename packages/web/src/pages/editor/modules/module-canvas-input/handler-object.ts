import { EntityWith } from "game/src/framework/entity"
import { changeAnchor, Point, Transform } from "game/src/model/utils"
import { deepClone } from "valtio/utils"
import { EditorComponents } from "../../store/model"
import { EditorStore } from "../../store/store"
import { CanvasEvent } from "../../views/canvas/canvas-event"
import { cursor, findEdgeForEntity, isPointInsideEntity } from "./util"

export class HandlerObject {
    private objects: readonly EntityWith<EditorComponents, "identity" | "size" | "transform">[]
    private shapes: readonly EntityWith<EditorComponents, "shape" | "transform">[]
    private state:
        | {
              type: "default"
          }
        | {
              type: "moving"
              moving: {
                  entity: EntityWith<EditorComponents, "identity" | "size" | "transform">
                  offset: Point
                  before: Transform
              }[]
          }

    constructor(private store: EditorStore) {
        this.objects = store.entities.multiple("identity", "size", "transform")
        this.shapes = store.entities.multiple("shape", "transform")
        this.state = {
            type: "default",
        }
    }

    handleDefault(event: CanvasEvent) {
        if (event.consumed || event.type === "wheel") {
            return
        }

        const focus = this.store.resources.get("focus")

        for (const entity of this.objects) {
            const identity = entity.get("identity")
            const transform = entity.get("transform")
            const size = entity.get("size")

            const isInside = isPointInsideEntity(event.position, transform, size)

            if (isInside) {
                focus.bundlesHighlighted.clear()
                focus.bundlesHighlighted.add(identity.bundleId)

                if (event.ctrlKey) {
                    if (event.leftButtonClicked) {
                        cursor.grabbing()

                        this.state = {
                            type: "moving",
                            moving: [
                                {
                                    entity,
                                    offset: {
                                        x: transform.point.x - event.positionInGrid.x,
                                        y: transform.point.y - event.positionInGrid.y,
                                    },
                                    before: deepClone(transform),
                                },
                            ],
                        }

                        this.handleMoving(event)
                    } else {
                        cursor.grabbable()
                    }
                } else if (event.leftButtonClicked && event.shiftKey) {
                    focus.bundlesSelected.add(identity.bundleId)
                } else if (event.leftButtonClicked) {
                    focus.bundlesSelected.clear()
                    focus.bundlesSelected.add(identity.bundleId)
                }

                event.consumed = true
            }
        }
    }

    handleMoving(event: CanvasEvent) {
        if (event.consumed || this.state.type !== "moving") {
            return
        }

        event.consumed = true

        const focus = this.store.resources.get("focus")

        for (const { entity } of this.state.moving) {
            focus.bundlesHighlighted.add(entity.get("identity").bundleId)
        }

        if (event.leftButtonDown) {
            cursor.grabbing()

            if (this.tryClipObjectToShape(event)) {
                return
            }

            for (const { entity, offset } of this.state.moving) {
                const transform = entity.get("transform")

                transform.point.x = event.positionInGrid.x + offset.x
                transform.point.y = event.positionInGrid.y + offset.y
                transform.rotation = 0
            }
        } else {
            cursor.grabbable()

            this.state = {
                type: "default",
            }
        }
    }

    private tryClipObjectToShape(event: CanvasEvent) {
        if (this.state.type !== "moving") {
            throw new Error("Expected moving state")
        }

        if (this.state.moving.length !== 1) {
            return false
        }

        const [first] = this.state.moving

        const size = first.entity.get("size")
        const transform = first.entity.get("transform")

        const edge = findEdgeForEntity(event.position, true, this.shapes)

        if (edge === undefined) {
            return false
        }

        const transposed = changeAnchor(
            edge.point,
            edge.rotation,
            size,
            { x: 0.5, y: 0.5 },
            { x: 0.5, y: 1 },
        )

        transform.point.x = transposed.x
        transform.point.y = transposed.y
        transform.rotation = edge.rotation

        return true
    }
}
