import deepEqual from "deep-equal"
import { Point } from "game/src/model/utils"
import { Immutable } from "immer"
import { useEditorStore } from "../../../store/store"
import { EditorEntityWith, EditorWorld, entitiesWith } from "../../../store/world"
import { Event, EventContext } from "./event"
import { cursor } from "./util"
import {
    boundsSides,
    chooseAxis,
    findCameraLineCloseTo as findBoundLineCloseTo,
} from "./util-bounds"

type BoundsSide = "left" | "right" | "top" | "bottom"

export class HandlerBounds {
    private state:
        | {
              type: "default"
          }
        | {
              type: "moving"
              entity: Immutable<EditorEntityWith<"bounds">>
              entityKey: string
              offset: Point
          }
        | {
              type: "moving-line"
              side: BoundsSide
              entity: Immutable<EditorEntityWith<"bounds">>
              entityKey: string
              offset: number
          }

    private bounds: Immutable<[string, EditorEntityWith<"bounds" | "transform">][]>

    constructor(
        private context: EventContext,
        private world: Immutable<EditorWorld>,
    ) {
        this.state = {
            type: "default",
        }

        this.bounds = [...entitiesWith(world, "bounds", "transform")]
    }

    handleDefault(event: Event) {
        if (event.consumed || event.type === "wheel") {
            return
        }

        for (const [key, entity] of this.bounds) {
            if (!useEditorStore.getState().isEntityActive(entity)) {
                continue
            }

            const sideOfLine = findBoundLineCloseTo(entity, event.position)

            if (sideOfLine) {
                if (event.leftButtonClicked && event.ctrlKey) {
                    cursor.grabbing()

                    this.state = {
                        type: "moving",
                        entity,
                        entityKey: key,
                        offset: event.positionInGrid,
                    }

                    this.handleMoving(event)
                } else if (event.leftButtonClicked) {
                    cursor.grabbing()

                    this.state = {
                        type: "moving-line",
                        entity,
                        entityKey: key,
                        side: sideOfLine,
                        offset: chooseAxis(sideOfLine, event.positionInGrid),
                    }

                    this.handleMovingSide(event)
                } else if (event.ctrlKey) {
                    cursor.grabbable()
                    useEditorStore.getState().highlight(key, { line: "all" })
                } else {
                    cursor.grabbable()
                    useEditorStore.getState().highlight(key, { line: sideOfLine })
                }

                if (event.rightButtonClicked) {
                    useEditorStore.getState().setCanvasContextMenu({
                        entityKey: key,
                        position: event.positionInGrid,
                        positionWindow: event.positionInWindow,
                    })
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

        const newBounds = { ...this.state.entity.bounds }

        for (const side of boundsSides) {
            newBounds[side] =
                newBounds[side] -
                chooseAxis(side, this.state.offset) +
                chooseAxis(side, event.positionInGrid)
        }

        if (event.leftButtonDown) {
            cursor.grabbing()
            useEditorStore.getState().invoke(this.state.entityKey, "bounds", newBounds)
        } else {
            cursor.grabbable()

            const state = this.state

            if (!deepEqual(newBounds, state.entity.bounds)) {
                useEditorStore.getState().updateWorld(world => {
                    const entity = world.entities[state.entityKey]

                    if ("bounds" in entity) {
                        entity.bounds = newBounds
                    }
                })
            }

            this.state = {
                type: "default",
            }
        }
    }

    handleMovingSide(event: Event) {
        if (event.consumed || this.state.type !== "moving-line") {
            return
        }

        event.consumed = true

        const newBounds = { ...this.state.entity.bounds }

        newBounds[this.state.side] =
            newBounds[this.state.side] -
            this.state.offset +
            chooseAxis(this.state.side, event.positionInGrid)

        if (event.leftButtonDown) {
            cursor.grabbing()
            useEditorStore.getState().invoke(this.state.entityKey, "bounds", newBounds)
        } else {
            cursor.grabbable()

            if (newBounds.left > newBounds.right) {
                const temp = newBounds.left
                newBounds.left = newBounds.right
                newBounds.right = temp
            }

            if (newBounds.top > newBounds.bottom) {
                const temp = newBounds.top
                newBounds.top = newBounds.bottom
                newBounds.bottom = temp
            }

            const state = this.state

            if (!deepEqual(newBounds, state.entity.bounds)) {
                useEditorStore.getState().updateWorld(world => {
                    const entity = world.entities[state.entityKey]

                    if ("bounds" in entity) {
                        entity.bounds = newBounds
                    }
                })
            }

            this.state = {
                type: "default",
            }
        }
    }
}
