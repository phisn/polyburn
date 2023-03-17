import { useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"

import { buildCanvasToWorld } from "../Editor"
import { useEditorStore } from "../editor-store/useEditorStore"
import { EditorInputEvent, PointerHandlerParams } from "./EventDefinitions"

function useEventListener(f: (params: PointerHandlerParams) => void) {
    const lastPointerEventRef = useRef<EditorInputEvent | null>()

    const canvas = useThree(state => state.gl.domElement)
    const camera = useThree(state => state.camera)
    const raycaster = useThree(state => state.raycaster)
    const scene = useThree(state => state.scene)

    const canvasToWorld = useMemo(() => buildCanvasToWorld(camera, canvas), [camera, canvas])
    
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
            const point = canvasToWorld(event.windowPoint.x, event.windowPoint.y)

            const params = {
                canvas,
                camera,
                raycaster,
                scene,
                point,
                event,
                previousEvent: lastPointerEventRef.current ?? undefined,
                action: void 0
            }

            lastPointerEventRef.current = event

            f(params)
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
}

export default useEventListener
