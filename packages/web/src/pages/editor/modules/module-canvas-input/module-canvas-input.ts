import { EntityWith } from "game/src/framework/entity"
import { Point } from "game/src/model/utils"
import { EditorComponents } from "../../store/model"
import { EditorStore } from "../../store/store"
import { CanvasEvent } from "../../views/canvas/canvas-event"
import { isPointInsideEntity } from "./util"

export class ModuleCanvasInput {
    private unsubscribe: (() => void)[]

    private handlerBackground: HandlerBackground
    private handlerObject: HandlerObject

    constructor(private store: EditorStore) {
        this.unsubscribe = []

        this.handlerBackground = new HandlerBackground(store)
        this.handlerObject = new HandlerObject(store)

        this.unsubscribe.push(
            store.events.listen({
                canvas: this.handleEvent.bind(this),
            }),
        )
    }

    onDispose() {
        for (const unsubscribe of this.unsubscribe) {
            unsubscribe()
        }
    }

    private handleEvent(event: CanvasEvent) {
        this.handlerBackground.handleMoving(event)
        this.handlerObject.handleMoving(event)

        this.handlerObject.handleSelected(event)

        this.handlerObject.handleDefault(event)
        this.handlerBackground.handleDefault(event)
    }
}

export class HandlerObject {
    private objects: readonly EntityWith<EditorComponents, "size" | "transform">[]

    constructor(private store: EditorStore) {
        this.objects = store.entities.multiple("size", "transform")
    }

    handleDefault(event: CanvasEvent) {
        if (event.type === "wheel") {
            return
        }

        for (const entity of this.objects) {
            const transform = entity.get("transform")
            const size = entity.get("size")

            const isInside = isPointInsideEntity(transform, size)

            if (isInside) {
                store.highlight({
                    type: "object-highlight",
                    targetId: entity.id,
                })

                if (event.shiftKey) {
                    if (event.leftButtonClicked) {
                        cursor.grabbing()

                        updateStateToMoving(entity)
                    } else {
                        cursor.grabbable()
                    }
                } else if (event.leftButtonClicked) {
                    store.select(entity.id)
                }

                return ConsumeEvent
            }
        }

        function updateStateToMoving(entity: ImmutableEntityWith<"object">) {
            state.ref = {
                type: "moving",

                entries: [
                    {
                        entity,
                        offsetPosition: {
                            x: entity.object.position.x - event.positionInGrid.x,
                            y: entity.object.position.y - event.positionInGrid.y,
                        },
                        offsetRotation: entity.object.rotation,

                        position: entity.object.position,
                        rotation: entity.object.rotation,
                    },
                ],
            }

            pipelineStageObjectMoving(event, context)
        }
    }

    handleSelected(event: CanvasEvent) {}

    handleMoving(event: CanvasEvent) {}
}

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
        if (event.consumed) {
            return
        }

        if (this.state.type !== "default") {
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
        if (event.consumed) {
            return
        }

        if (this.state.type !== "moving") {
            return
        }

        const camera = this.store.resources.get("camera")

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
                this.state.startPosition.x === camera.position.x &&
                this.state.startPosition.y === camera.position.y
            ) {
                // store.deselect()
            }

            this.state = { type: "default" }
        }
    }
}
