import deepEqual from "deep-equal"
import { changeAnchor, Point, Transform } from "game/src/model/utils"
import { Immutable } from "immer"
import { deepClone } from "valtio/utils"
import { useEditorStore } from "../../../store/store"
import { EditorEntityWith, EditorWorld, entitiesWith } from "../../../store/world"
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
                  current: Transform
                  entity: Immutable<EditorEntityWith<"transform">>
                  entityKey: string
                  offset: Point
              }[]
          }

    private shapes: Immutable<EditorEntityWith<"transform" | "vertices">[]>
    private objects: Immutable<[string, EditorEntityWith<"size" | "transform">][]>

    constructor(
        private context: EventContext,
        private world: Immutable<EditorWorld>,
    ) {
        this.state = {
            type: "default",
        }

        this.objects = [...entitiesWith(world, "size", "transform")]
        this.shapes = [...entitiesWith(world, "transform", "vertices").map(([_, entity]) => entity)]
    }

    handleDefault(event: Event) {
        if (event.consumed || event.type === "wheel") {
            return
        }

        for (const [key, entity] of this.objects) {
            const isInside = isPointInsideEntity(event.position, entity.transform, entity.size)

            if (isInside) {
                useEditorStore.getState().highlight(key)

                if (event.ctrlKey) {
                    if (event.leftButtonClicked) {
                        cursor.grabbing()

                        this.state = {
                            type: "moving",
                            moving: [
                                {
                                    current: deepClone(entity.transform),
                                    entity,
                                    entityKey: key,
                                    offset: {
                                        x: entity.transform.point.x - event.positionInGrid.x,
                                        y: entity.transform.point.y - event.positionInGrid.y,
                                    },
                                },
                            ],
                        }

                        this.handleMoving(event)
                    } else {
                        cursor.grabbable()
                    }
                } else if (event.leftButtonClicked) {
                    useEditorStore.getState().select(key, event.shiftKey)
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

            for (const { entityKey, offset, current } of this.state.moving) {
                current.point.x = event.positionInGrid.x + offset.x
                current.point.y = event.positionInGrid.y + offset.y
                current.rotation = 0

                useEditorStore.getState().invoke(entityKey, "transform", current)
            }
        } else {
            cursor.grabbable()

            const state = this.state.moving

            if (state.every(x => deepEqual(x.entity.transform, x.current)) === false) {
                useEditorStore.getState().updateWorld(world => {
                    for (const { entityKey, current } of state) {
                        const entity = world.entities[entityKey]

                        if ("transform" in entity) {
                            entity.transform.point.x = current.point.x
                            entity.transform.point.y = current.point.y
                            console.log("set", current.rotation)
                            entity.transform.rotation = current.rotation

                            console.log("moving to: ", deepClone(entity.transform))
                        }
                    }
                })
            }

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

        if (!("size" in first.entity)) {
            return false
        }

        const edge = findEdgeForEntity(event.position, true, this.shapes)

        if (edge === undefined) {
            return false
        }

        const transposed = changeAnchor(
            edge.point,
            edge.rotation,
            first.entity.size,
            { x: 0.5, y: 0.5 },
            { x: 0.5, y: 1 },
        )

        first.current.point.x = transposed.x
        first.current.point.y = transposed.y
        console.log(edge.rotation)
        first.current.rotation = edge.rotation

        useEditorStore.getState().invoke(first.entityKey, "transform", first.current)

        return true
    }
}
