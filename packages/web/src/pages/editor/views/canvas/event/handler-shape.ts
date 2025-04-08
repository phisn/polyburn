import deepEqual from "deep-equal"
import { Point, ShapeVertex, Transform } from "game/src/model/utils"
import { Immutable } from "immer"
import { deepClone } from "valtio/utils"
import {
    highlightColor,
    highlightDeleteColor,
    highlightOverrideColor,
    snapDistance,
} from "../../../constants"
import { useEditorStore } from "../../../store/store"
import { EditorEntityWith, EditorWorld, entitiesWith } from "../../../store/world"
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
                  current: Transform
                  entity: Immutable<EditorEntityWith<"transform">>
                  entityKey: string
                  offset: Point
              }[]
          }
        | {
              type: "vertex"

              duplicate?: {
                  index: number
                  vertex: ShapeVertex
              }

              current: ShapeVertex[]
              entity: Immutable<EditorEntityWith<"transform" | "vertices">>
              entityKey: string
              index: number
          }

    private shapes: Immutable<[string, EditorEntityWith<"transform" | "vertices">][]>

    constructor(
        private context: EventContext,
        private world: Immutable<EditorWorld>,
    ) {
        this.state = {
            type: "default",
        }

        this.shapes = [...entitiesWith(world, "transform", "vertices")]
    }

    handleDefault(event: Event) {
        if (this.state.type !== "default" || event.consumed) {
            return
        }

        for (const [key, shape] of this.shapes) {
            const selected = useEditorStore.getState().selected.has(key)

            if (selected) {
                const closestVertex = findClosestVertex(shape, event.position, snapDistance)

                if (closestVertex) {
                    event.consumed = true
                    cursor.grabbable()

                    if (event.ctrlKey) {
                        useEditorStore.getState().highlight(key, {
                            point: closestVertex.point,
                            color: highlightDeleteColor,
                        })

                        if (event.leftButtonClicked && shape.vertices.length > 3) {
                            useEditorStore.getState().updateWorld(world => {
                                const entity = world.entities[key]

                                if ("vertices" in entity) {
                                    entity.vertices.splice(closestVertex.vertexIndex, 1)
                                }
                            })
                        } else if (event.leftButtonClicked) {
                            useEditorStore.getState().updateWorld(world => {
                                delete world.entities[key]
                            })
                        }

                        return
                    }

                    if (event.leftButtonClicked) {
                        cursor.grabbing()

                        this.state = {
                            type: "vertex",

                            entity: shape,
                            entityKey: key,
                            index: closestVertex.vertexIndex,
                            current: deepClone(shape.vertices) as ShapeVertex[],
                        }

                        this.handleVertex(event)
                    }

                    useEditorStore.getState().highlight(key, {
                        point: closestVertex.point,
                        color: highlightColor,
                    })

                    return
                }

                const closestEdge = findClosestEdge([shape], event.position, snapDistance)

                if (closestEdge) {
                    cursor.pointer()

                    if (event.leftButtonClicked) {
                        cursor.grabbing()

                        const vertices = deepClone(shape.vertices) as ShapeVertex[]
                        vertices.splice(closestEdge.edge[0] + 1, 0, {
                            color: averageColor(
                                shape.vertices[closestEdge.edge[0]].color,
                                shape.vertices[closestEdge.edge[1]].color,
                            ),
                            point: {
                                x: 0,
                                y: 0,
                            },
                        })

                        this.state = {
                            type: "vertex",

                            entity: shape,
                            entityKey: key,
                            index: closestEdge.edge[0] + 1,
                            current: vertices,
                        }

                        this.handleVertex(event)
                    } else {
                        useEditorStore.getState().highlight(key, {
                            point: closestEdge.point,
                            color: highlightColor,
                        })
                    }

                    event.consumed = true
                    return
                }

                const isPointInside = isPointInsideShape(shape, event.position)

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
                                    current: deepClone(shape.transform),
                                    entity: shape,
                                    entityKey: key,
                                    offset: {
                                        x: shape.transform.point.x - event.positionInGrid.x,
                                        y: shape.transform.point.y - event.positionInGrid.y,
                                    },
                                },
                            ],
                        }

                        this.handleMoving(event)
                    }

                    return
                }
            } else {
                const isInside = isPointInsideShape(shape, event.position)

                if (isInside) {
                    useEditorStore.getState().highlight(key)

                    if (event.ctrlKey) {
                        cursor.grabbable()
                    }

                    if (event.leftButtonClicked && event.ctrlKey) {
                        this.state = {
                            type: "moving",
                            moving: [
                                {
                                    current: deepClone(shape.transform),
                                    entity: shape,
                                    entityKey: key,
                                    offset: {
                                        x: shape.transform.point.x - event.positionInGrid.x,
                                        y: shape.transform.point.y - event.positionInGrid.y,
                                    },
                                },
                            ],
                        }

                        this.handleMoving(event)
                    } else if (event.leftButtonClicked) {
                        useEditorStore.getState().select(key, event.shiftKey)
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

            for (const { current, entityKey, offset } of this.state.moving) {
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
                            entity.transform.rotation = current.rotation
                        }
                    }
                })
            }

            this.state = {
                type: "default",
            }
        }
    }

    handleVertex(event: Event) {
        if (event.consumed || this.state.type !== "vertex") {
            return
        }

        const state = this.state

        if (event.leftButtonDown) {
            event.consumed = true
            cursor.grabbing()

            const vertexInShape = state.current[state.index]

            const point = {
                x: event.positionInGrid.x - state.entity.transform.point.x,
                y: event.positionInGrid.y - state.entity.transform.point.y,
            }

            if (point.x === vertexInShape.point.x && point.y === vertexInShape.point.y) {
                useEditorStore.getState().highlight(state.entityKey, {
                    point: {
                        x: vertexInShape.point.x + state.entity.transform.point.x,
                        y: vertexInShape.point.y + state.entity.transform.point.y,
                    },

                    color:
                        this.state.duplicate === undefined
                            ? highlightColor
                            : highlightOverrideColor,
                })

                return
            }

            if (state.duplicate) {
                state.current[state.index] = state.duplicate.vertex
                state.current.splice(state.duplicate.index, 0, vertexInShape)

                state.index = state.duplicate.index
                state.duplicate = undefined
            }

            const previousX = vertexInShape.point.x
            const previousY = vertexInShape.point.y

            vertexInShape.point.x = point.x
            vertexInShape.point.y = point.y

            const duplicateIndex = state.current.findIndex(
                (v, i) =>
                    v.point.x === state.current[state.index].point.x &&
                    v.point.y === state.current[state.index].point.y &&
                    i !== state.index,
            )

            if (duplicateIndex !== -1) {
                if (!canRemoveVertex(this.state.index, state.current)) {
                    vertexInShape.point.x = previousX
                    vertexInShape.point.y = previousY

                    useEditorStore.getState().highlight(state.entityKey, {
                        point: {
                            x: vertexInShape.point.x + state.entity.transform.point.x,
                            y: vertexInShape.point.y + state.entity.transform.point.y,
                        },
                        color: highlightColor,
                    })

                    cursor.notAllowed()

                    useEditorStore.getState().invoke(state.entityKey, "vertices", state.current)

                    return
                }

                useEditorStore.getState().highlight(state.entityKey, {
                    point: {
                        x: vertexInShape.point.x + state.entity.transform.point.x,
                        y: vertexInShape.point.y + state.entity.transform.point.y,
                    },
                    color: highlightOverrideColor,
                })

                this.state.duplicate = {
                    index: this.state.index,
                    vertex: state.current[duplicateIndex],
                }

                state.current[duplicateIndex] = vertexInShape
                state.current.splice(this.state.index, 1)

                this.state.index =
                    this.state.index < duplicateIndex ? duplicateIndex - 1 : duplicateIndex

                useEditorStore.getState().invoke(state.entityKey, "vertices", state.current)
            } else {
                const area = shapeArea(state.current)

                if (area <= 0.1) {
                    vertexInShape.point.x = previousX
                    vertexInShape.point.y = previousY

                    cursor.notAllowed()

                    return
                }

                const conflict = resolveConflictsAround(this.state.index, state.current)

                useEditorStore.getState().highlight(state.entityKey, {
                    point: {
                        x: vertexInShape.point.x + state.entity.transform.point.x,
                        y: vertexInShape.point.y + state.entity.transform.point.y,
                    },
                    color: highlightColor,
                })

                useEditorStore.getState().invoke(state.entityKey, "vertices", state.current)

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
        } else {
            this.state = {
                type: "default",
            }

            if (deepEqual(state.entity.vertices, state.current) === false) {
                useEditorStore.getState().updateWorld(world => {
                    const entity = world.entities[state.entityKey]

                    if ("vertices" in entity) {
                        entity.vertices = deepClone(state.current)
                    }
                })
            }

            this.handleDefault(event)
        }
    }
}
