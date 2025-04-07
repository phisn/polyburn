import { changeAnchor, Point, Transform } from "game/src/model/utils"
import { Entity, World } from "koota"
import { deepClone } from "valtio/utils"
import { BehaviorSize, BehaviorTransform, editorActions, Shape } from "../../../store/world"
import { Event, EventContext } from "./event"
import { cursor, findEdgeForEntity, isPointInsideEntity } from "./util"

export class HandlerObject {
    private state:
        | {
              type: "default"
          }
        | {
              type: "moving"
              moving: {
                  entity: Entity
                  offset: Point
                  before: Transform
              }[]
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
        if (event.consumed || event.type === "wheel") {
            return
        }

        for (const entity of this.world.query(BehaviorTransform, BehaviorSize)) {
            const size = entity.get(BehaviorSize)!
            const transform = entity.get(BehaviorTransform)!

            const isInside = isPointInsideEntity(event.position, transform, size)

            if (isInside) {
                editorActions(this.world).highlight(entity)

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
                    editorActions(this.world).selectAdditive(entity)
                } else if (event.leftButtonClicked) {
                    editorActions(this.world).select(entity)
                }

                event.consumed = true
            }
        }
    }

    handleMoving(event: Event) {
        if (event.consumed || this.state.type !== "moving") {
            return
        }

        event.consumed = true

        if (event.leftButtonDown) {
            cursor.grabbing()

            if (this.tryClipObjectToShape(event)) {
                return
            }

            for (const { entity, offset } of this.state.moving) {
                const transform = entity.get(BehaviorTransform)!

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

    private tryClipObjectToShape(event: Event) {
        if (this.state.type !== "moving") {
            throw new Error("Expected moving state")
        }

        if (this.state.moving.length !== 1) {
            return false
        }

        const [first] = this.state.moving

        const size = first.entity.get(BehaviorSize)!
        const transform = first.entity.get(BehaviorTransform)!

        const edge = findEdgeForEntity(event.position, true, this.world.query(Shape))

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
