import { EntityWith } from "game/src/framework/entity"
import { Point, Transform } from "game/src/model/utils"
import {
    highlightColor,
    highlightDeleteColor,
    highlightOverrideColor,
    snapDistance,
} from "../../constants"
import { EditableShapeVertex, EditorComponents } from "../../store/model"
import { EditorStore } from "../../store/store"
import { CanvasEvent } from "../../views/canvas/canvas-event"
import { cursor, findClosestEdge, findClosestVertex } from "./util"
import {
    averageColor,
    canRemoveVertex,
    isPointInsideShape,
    resolveConflictsAround,
    shapeArea,
} from "./util-shape"

export class HandlerShape {
    private shapes: readonly EntityWith<EditorComponents, "identity" | "shape" | "transform">[]
    private state:
        | {
              type: "default"
          }
        | {
              type: "moving"
              moving: {
                  entity: EntityWith<EditorComponents, "identity" | "transform">
                  offset: Point
                  before: Transform
              }[]
          }
        | {
              type: "vertex"

              duplicate?: {
                  index: number
                  vertex: EditableShapeVertex
              }
              index: number
              shape: EntityWith<EditorComponents, "identity" | "shape" | "transform">
          }

    constructor(private store: EditorStore) {
        this.shapes = store.entities.multiple("identity", "shape", "transform")
        this.state = {
            type: "default",
        }
    }

    handleDefault(event: CanvasEvent) {
        if (this.state.type !== "default" || event.consumed) {
            return
        }

        const focus = this.store.resources.get("focus")

        for (const shapeEntity of this.shapes) {
            const identity = shapeEntity.get("identity")
            const shape = shapeEntity.get("shape")
            const transform = shapeEntity.get("transform")

            if (focus.bundlesSelected.has(identity.bundleId)) {
                const closestVertex = findClosestVertex(shapeEntity, event.position, snapDistance)

                if (closestVertex) {
                    event.consumed = true
                    cursor.grabbable()

                    if (event.ctrlKey) {
                        focus.highlightPoints.push({
                            color: highlightDeleteColor,
                            point: closestVertex.point,
                        })

                        if (event.leftButtonClicked && shape.vertices.length > 3) {
                            shape.vertices.splice(closestVertex.vertexIndex, 1)
                        } else if (event.leftButtonClicked) {
                            this.store.entities.remove(shapeEntity)
                        }

                        return
                    }

                    if (event.leftButtonClicked) {
                        cursor.grabbing()

                        this.state = {
                            type: "vertex",
                            index: closestVertex.vertexIndex,
                            shape: shapeEntity,
                        }

                        this.handleVertex(event)
                    }

                    focus.highlightPoints.push({
                        color: highlightColor,
                        point: closestVertex.point,
                    })

                    return
                }

                const closestEdge = findClosestEdge([shapeEntity], event.position, snapDistance)

                if (closestEdge) {
                    cursor.pointer()

                    if (event.leftButtonClicked) {
                        cursor.grabbing()

                        shape.vertices.splice(closestEdge.edge[0] + 1, 0, {
                            color: averageColor(
                                shape.vertices[closestEdge.edge[0]].color,
                                shape.vertices[closestEdge.edge[1]].color,
                            ),
                            point: {
                                x: 0,
                                y: 0,
                            },
                        })

                        console.log(closestEdge.edge[0], closestEdge.edge[1])

                        this.state = {
                            type: "vertex",
                            index: closestEdge.edge[0] + 1,
                            shape: shapeEntity,
                        }

                        this.handleVertex(event)
                    } else {
                        focus.highlightPoints.push({
                            color: highlightColor,
                            point: closestEdge.point,
                        })
                    }

                    event.consumed = true
                    return
                }

                const isPointInside = isPointInsideShape(shapeEntity, event.position)

                if (isPointInside) {
                    event.consumed = true

                    if (event.ctrlKey) {
                        cursor.grabbable()
                    }

                    if (event.leftButtonClicked && event.ctrlKey) {
                        this.state = {
                            type: "moving",
                            moving: [
                                {
                                    before: transform,
                                    entity: shapeEntity,
                                    offset: {
                                        x: transform.point.x - event.positionInGrid.x,
                                        y: transform.point.y - event.positionInGrid.y,
                                    },
                                },
                            ],
                        }

                        this.handleMoving(event)
                    }

                    return
                }
            } else {
                const isInside = isPointInsideShape(shapeEntity, event.position)

                if (isInside) {
                    focus.bundlesHighlighted.add(identity.bundleId)

                    if (event.ctrlKey) {
                        cursor.grabbable()
                    }

                    if (event.leftButtonClicked && event.ctrlKey) {
                        this.state = {
                            type: "moving",
                            moving: [
                                {
                                    before: transform,
                                    entity: shapeEntity,
                                    offset: {
                                        x: transform.point.x - event.positionInGrid.x,
                                        y: transform.point.y - event.positionInGrid.y,
                                    },
                                },
                            ],
                        }

                        this.handleMoving(event)
                    } else if (event.leftButtonClicked) {
                        focus.bundlesSelected.add(identity.bundleId)
                    }

                    if (event.rightButtonClicked) {
                        console.warn("Todo!")
                    }

                    event.consumed = true
                }
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

    handleVertex(event: CanvasEvent) {
        if (event.consumed || this.state.type !== "vertex") {
            return
        }

        const focus = this.store.resources.get("focus")
        const shape = this.state.shape.get("shape")
        const state = this.state
        const transform = this.state.shape.get("transform")

        if (event.leftButtonDown) {
            cursor.grabbing()

            const vertexInShape = shape.vertices[this.state.index]

            const point = {
                x: event.positionInGrid.x - transform.point.x,
                y: event.positionInGrid.y - transform.point.y,
            }

            if (point.x === vertexInShape.point.x && point.y === vertexInShape.point.y) {
                focus.highlightPoints.push({
                    color:
                        this.state.duplicate === undefined
                            ? highlightColor
                            : highlightOverrideColor,
                    point: {
                        x: vertexInShape.point.x + transform.point.x,
                        y: vertexInShape.point.y + transform.point.y,
                    },
                })

                return
            }

            if (this.state.duplicate) {
                shape.vertices[this.state.index] = this.state.duplicate.vertex
                shape.vertices.splice(this.state.duplicate.index, 0, vertexInShape)

                this.state.index = this.state.duplicate.index

                this.state.duplicate = undefined
            }

            const previousX = vertexInShape.point.x
            const previousY = vertexInShape.point.y

            vertexInShape.point.x = point.x
            vertexInShape.point.y = point.y

            const duplicateIndex = shape.vertices.findIndex(
                (v, i) =>
                    v.point.x === shape.vertices[state.index].point.x &&
                    v.point.y === shape.vertices[state.index].point.y &&
                    i !== state.index,
            )

            if (duplicateIndex !== -1) {
                if (!canRemoveVertex(this.state.index, shape.vertices)) {
                    vertexInShape.point.x = previousX
                    vertexInShape.point.y = previousY

                    focus.highlightPoints.push({
                        color: highlightColor,
                        point: {
                            x: vertexInShape.point.x + transform.point.x,
                            y: vertexInShape.point.y + transform.point.y,
                        },
                    })

                    cursor.notAllowed()

                    return
                }

                focus.highlightPoints.push({
                    color: highlightOverrideColor,
                    point: {
                        x: vertexInShape.point.x + transform.point.x,
                        y: vertexInShape.point.y + transform.point.y,
                    },
                })

                this.state.duplicate = {
                    index: this.state.index,
                    vertex: shape.vertices[duplicateIndex],
                }

                shape.vertices[duplicateIndex] = vertexInShape
                shape.vertices.splice(this.state.index, 1)

                this.state.index =
                    this.state.index < duplicateIndex ? duplicateIndex - 1 : duplicateIndex
            } else {
                const area = shapeArea(shape.vertices)

                if (area <= 0.1) {
                    vertexInShape.point.x = previousX
                    vertexInShape.point.y = previousY

                    cursor.notAllowed()

                    return
                }

                const conflict = resolveConflictsAround(this.state.index, shape.vertices)

                focus.highlightPoints.push({
                    color: highlightColor,
                    point: {
                        x: vertexInShape.point.x + transform.point.x,
                        y: vertexInShape.point.y + transform.point.y,
                    },
                })

                if (conflict === null) {
                    vertexInShape.point.x = previousX
                    vertexInShape.point.y = previousY

                    cursor.notAllowed()

                    return
                }

                if (conflict !== this.state.index) {
                    this.state.index = conflict
                }
            }

            event.consumed = true
        } else {
            this.state = {
                type: "default",
            }

            this.handleDefault(event)
        }
    }
}
