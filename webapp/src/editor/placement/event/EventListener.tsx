import { useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"

import { buildCanvasToWorld } from "../../Editor"
import { useEditorStore } from "../../editor-store/useEditorStore"
import { ActionType } from "../state/Action"
import { defaultActionHandler } from "./DefaultActionHandler"
import { EditorInputEvent } from "./Definitions"
import { insertActionHandler } from "./InsertVertexActionHandler"
import { moveVertexActionHandler } from "./MoveVertexActionHandler"
import { placeEntityActionHandler } from "./PlaceEntityActionHandler"

function EventListener() {
    const lastPointerEventRef = useRef<EditorInputEvent | null>()

    const canvas = useThree(state => state.gl.domElement)
    const camera = useThree(state => state.camera)
    const raycaster = useThree(state => state.raycaster)
    const scene = useThree(state => state.scene)

    const canvasToWorld = useMemo(() => buildCanvasToWorld(camera, canvas), [camera, canvas])
    
    console.log("EventListener")
    useEffect(() => {
        const onPointerEvent = (event: PointerEvent) => {
            onEditorInputEvent({
                windowPoint: { x: event.clientX, y: event.clientY },
                delete: event.ctrlKey,
                snap: event.shiftKey,

                leftButton: (event.buttons & 1) === 1,
                rightButton: (event.buttons & 2) === 2
            })
        }

        const onEditorInputEvent = (event: EditorInputEvent) => {
            const state = useEditorStore.getState()
            const point = canvasToWorld(event.windowPoint.x, event.windowPoint.y)
            let action = state.modeState.action

            const params = {
                canvas,
                camera,
                raycaster,
                scene,
                point,
                event,
                previousEvent: lastPointerEventRef.current ?? undefined
            }

            lastPointerEventRef.current = event

            switch (action?.type) {
            case ActionType.InsertVertex:
                insertActionHandler({
                    ...params,
                    action
                })

                break
            case ActionType.MoveVertex:
                moveVertexActionHandler({
                    ...params,
                    action
                })

                break
                    
            case ActionType.PlaceEntityInFuture:
                action = {
                    type: ActionType.PlaceEntity,
                    entity: {
                        position: point,
                        rotation: 0,
                        type: action.entityType,
                    }
                },

                state.setModeState({
                    action,
                })

                // fallthrough
            case ActionType.PlaceEntity:
                placeEntityActionHandler({
                    ...params,
                    action
                })

                break
            default:
                defaultActionHandler({
                    ...params,
                    action: void 0
                })

                break

            }
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if (!lastPointerEventRef.current) {
                return
            }

            if (e.key == "Escape") {
                useEditorStore.getState().setModeState({
                    action: null,
                    hint: null
                })

                onEditorInputEvent({
                    ...lastPointerEventRef.current,
                })
            }

            if (e.key === "Shift") {
                onEditorInputEvent({
                    ...lastPointerEventRef.current,
                    snap: true
                })
            }

            if (e.key === "Control") {
                onEditorInputEvent({
                    ...lastPointerEventRef.current,
                    delete: true
                })
            }
        }

        const onKeyUp = (e: KeyboardEvent) => {
            if (!lastPointerEventRef.current) {
                console.log("no last pointer event")
                return
            }

            if (e.key === "Shift") {
                onEditorInputEvent({
                    ...lastPointerEventRef.current,
                    snap: false
                })
            }

            if (e.key === "Control") {
                onEditorInputEvent({
                    ...lastPointerEventRef.current,
                    delete: false
                })
            }
        }

        canvas.addEventListener("pointermove", onPointerEvent)
        canvas.addEventListener("pointerdown", onPointerEvent)
        canvas.addEventListener("pointerup", onPointerEvent)

        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)

        return () => {
            canvas.removeEventListener("pointermove", onPointerEvent)
            canvas.removeEventListener("pointerdown", onPointerEvent)
            canvas.removeEventListener("pointerup", onPointerEvent)

            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)
        }
    })

    return (
        <>
        </>
    )
}

export default EventListener
