import { Point, Transform } from "game/src/model/utils"
import { Entity, World } from "koota"
import {
    highlightColor,
    highlightDeleteColor,
    highlightOverrideColor,
    snapDistance,
} from "../../../constants"
import {
    BehaviorShape,
    BehaviorTransform,
    EditableShapeVertex,
    editorActions,
    Highlighted,
    Selected,
} from "../../../store/world"
import { Event, EventContext } from "./event"
import { cursor, findClosestEdge, findClosestVertex } from "./util"
import {
    averageColor,
    canRemoveVertex,
    isPointInsideShape,
    resolveConflictsAround,
    shapeArea,
} from "./util-shape"

export class HandlerShape {
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
        | {
              type: "vertex"

              duplicate?: {
                  index: number
                  vertex: EditableShapeVertex
              }
              index: number
              shape: Entity
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
        if (this.state.type !== "default" || event.consumed) {
            return
        }

        for (const shapeEntity of this.world.query(BehaviorShape, BehaviorTransform)) {
            const shape = shapeEntity.get(BehaviorShape)!
            const transform = shapeEntity.get(BehaviorTransform)!

            if (shapeEntity.has(Selected)) {
                const closestVertex = findClosestVertex(shapeEntity, event.position, snapDistance)

                if (closestVertex) {
                    event.consumed = true
                    cursor.grabbable()

                    if (event.ctrlKey) {
                        shapeEntity.add(
                            Highlighted({
                                point: {
                                    ...closestVertex.point,
                                    color: highlightDeleteColor,
                                },
                            }),
                        )

                        if (event.leftButtonClicked && shape.vertices.length > 3) {
                            shape.vertices.splice(closestVertex.vertexIndex, 1)
                        } else if (event.leftButtonClicked) {
                            shapeEntity.destroy()
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

                    shapeEntity.add(
                        Highlighted({
                            point: {
                                ...closestVertex.point,
                                color: highlightColor,
                            },
                        }),
                    )

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
                        shapeEntity.add(
                            Highlighted({
                                point: {
                                    ...closestEdge.point,
                                    color: highlightColor,
                                },
                            }),
                        )
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
                    shapeEntity.add(Highlighted)

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
                    } else if (event.leftButtonClicked && event.shiftKey) {
                        editorActions(this.world).selectAdditive(shapeEntity)
                    } else if (event.leftButtonClicked) {
                        editorActions(this.world).select(shapeEntity)
                    }

                    if (event.rightButtonClicked) {
                        console.warn("Todo!")
                    }

                    event.consumed = true
                }
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

            for (const { entity, offset } of this.state.moving) {
                const transform = entity.get(BehaviorTransform)!

                transform.point.x = event.positionInGrid.x + offset.x
                transform.point.y = event.positionInGrid.y + offset.y
                transform.rotation = 0

                entity.changed(BehaviorTransform)
            }
        } else {
            cursor.grabbable()

            this.state = {
                type: "default",
            }
        }
    }

    handleVertex(event: Event) {
        if (event.consumed || this.state.type !== "vertex") {
            return
        }

        const shape = this.state.shape.get(BehaviorShape)!
        const state = this.state
        const transform = this.state.shape.get(BehaviorTransform)!

        this.state.shape.changed(BehaviorShape)

        if (event.leftButtonDown) {
            cursor.grabbing()

            const vertexInShape = shape.vertices[this.state.index]

            const point = {
                x: event.positionInGrid.x - transform.point.x,
                y: event.positionInGrid.y - transform.point.y,
            }

            if (point.x === vertexInShape.point.x && point.y === vertexInShape.point.y) {
                editorActions(this.world).highlight(state.shape, {
                    point: {
                        x: vertexInShape.point.x + transform.point.x,
                        y: vertexInShape.point.y + transform.point.y,

                        color:
                            this.state.duplicate === undefined
                                ? highlightColor
                                : highlightOverrideColor,
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

                    editorActions(this.world).highlight(state.shape, {
                        point: {
                            x: vertexInShape.point.x + transform.point.x,
                            y: vertexInShape.point.y + transform.point.y,
                            color: highlightColor,
                        },
                    })

                    cursor.notAllowed()

                    return
                }

                editorActions(this.world).highlight(state.shape, {
                    point: {
                        x: vertexInShape.point.x + transform.point.x,
                        y: vertexInShape.point.y + transform.point.y,
                        color: highlightOverrideColor,
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

                editorActions(this.world).highlight(state.shape, {
                    point: {
                        x: vertexInShape.point.x + transform.point.x,
                        y: vertexInShape.point.y + transform.point.y,
                        color: highlightColor,
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
