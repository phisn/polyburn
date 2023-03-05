import { World } from "@dimforge/rapier2d-compat"
import { useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import { buildCanvasToWorld } from "../../Editor"
import { useEditorStore } from "../../editor-store/useEditorStore"
import { snapDistance } from "../../Values"
import { Point } from "../../world/Point"
import { findClosestEdge, findClosestVertex } from "../../world/Shape"
import { insertShape, insertVertex, moveVertex } from "../../world/World"
import { ActionType } from "../state/Action"
import { HintType } from "../state/Hint"
import { defaultActionHandler } from "./DefaultActionHandler"
import { insertActionHandler } from "./InsertVertexActionHandler"
import { moveVertexActionHandler } from "./MoveVertexActionHandler"

function EventListener() {
    const lastPointerEventRef = useRef<PointerEvent | null>()

    const canvas = useThree(state => state.gl.domElement)
    const camera = useThree(state => state.camera)
    const raycaster = useThree(state => state.raycaster)
    const scene = useThree(state => state.scene)

    const canvasToWorld = useMemo(() => buildCanvasToWorld(camera, canvas), [camera, canvas])
    
    useEffect(() => {
        const onPointerEvent = (event: PointerEvent) => {
            lastPointerEventRef.current = event

            const point = canvasToWorld(event.clientX, event.clientY)
            const action = useEditorStore.getState().modeState.action

            const params = {
                canvas,
                camera,
                raycaster,
                scene,
                point,
                event
            }

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
                case ActionType.PlaceEntity:
                    /*
                    insertActionHandler({
                        ...params,
                        action
                    })
                    */

                    break
                default:
                    defaultActionHandler({
                        ...params,
                        action
                    })

                    break

            }
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if (!lastPointerEventRef.current) {
                return
            }

            if (e.key === "Shift") {
                onPointerEvent({
                    ...lastPointerEventRef.current,
                    shiftKey: true
                })
            }

            if (e.key === "Control") {
                onPointerEvent({
                    ...lastPointerEventRef.current,
                    ctrlKey: true
                })
            }
        }

        const onKeyUp = (e: KeyboardEvent) => {
            if (!lastPointerEventRef.current) {
                console.log("no last pointer event")
                return
            }

            if (e.key === "Shift") {
                onPointerEvent({
                    ...lastPointerEventRef.current,
                    shiftKey: false
                })
            }

            if (e.key === "Control") {
                onPointerEvent({
                    ...lastPointerEventRef.current,
                    ctrlKey: false
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
