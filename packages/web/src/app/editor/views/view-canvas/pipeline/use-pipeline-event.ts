import { useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { Vector3 } from "three"
import { PipelineEvent } from "./pipeline-event"

export function usePipelineEvent(onEvent: (event: PipelineEvent) => void) {
    const lastNativeEventRef = useRef<PipelineEvent | undefined>()

    const canvas = useThree(state => state.gl.domElement)
    const camera = useThree(state => state.camera)

    const invalidate = useThree(state => state.invalidate)

    useEffect(() => {
        const position = new Vector3()

        const onPointerEvent = (raw: PointerEvent) => {
            // cursor is by default "default". other cursors must be a result of this event handler
            if (window.document.body.style.cursor !== "default") {
                window.document.body.style.cursor = "default"
            }

            position.set(
                (raw.offsetX / canvas.clientWidth) * 2 - 1,
                -(raw.offsetY / canvas.clientHeight) * 2 + 1,
                0.5,
            )

            position.unproject(camera)

            const event: PipelineEvent = {
                type: raw.type,

                position: position,

                positionInGrid: new Vector3(
                    Math.round(position.x * 4) * 0.25,
                    Math.round(position.y * 4) * 0.25,
                    0,
                ),
                positionInWindow: { x: raw.offsetX, y: raw.offsetY },

                scroll: 0,

                leftButtonDown: (raw.buttons & 1) === 1,
                rightButtonDown: (raw.buttons & 2) === 2,

                leftButtonClicked: raw.type === "pointerdown" && (raw.buttons & 1) === 1,
                rightButtonClicked: raw.type === "pointerdown" && (raw.buttons & 2) === 2,

                leftButtonReleased:
                    lastNativeEventRef.current !== undefined &&
                    lastNativeEventRef.current.leftButtonDown &&
                    (raw.buttons & 1) === 0,
                rightButtonReleased:
                    lastNativeEventRef.current !== undefined &&
                    lastNativeEventRef.current.rightButtonDown &&
                    (raw.buttons & 2) === 0,

                shiftKey: raw.shiftKey,
                ctrlKey: raw.ctrlKey,

                consumed: raw.type === "pointerleave",
            }

            lastNativeEventRef.current = event
            onEvent(event)

            if (event.consumed) {
                raw.stopPropagation()
                raw.preventDefault()
            }

            // on demand rendering only renders if the scene changes. usually the scene is changed directly
            // so we need to manually trigger a render after each user interaction. the scene does not change
            // without user interaction so we only need invalidate here
            invalidate()
        }

        canvas.addEventListener("pointerdown", onPointerEvent)
        canvas.addEventListener("pointermove", onPointerEvent)
        canvas.addEventListener("pointerup", onPointerEvent)
        canvas.addEventListener("pointerleave", onPointerEvent)

        const onKeyDown = (event: KeyboardEvent) => {
            if (lastNativeEventRef.current === undefined) {
                return
            }

            if (window.document.body.style.cursor !== "default") {
                window.document.body.style.cursor = "default"
            }

            switch (event.code) {
                case "ShiftLeft":
                    onEvent(
                        (lastNativeEventRef.current = {
                            ...lastNativeEventRef.current,
                            type: event.type,
                            shiftKey: true,
                            consumed: false,
                        }),
                    )

                    break

                case "ControlLeft":
                    onEvent(
                        (lastNativeEventRef.current = {
                            ...lastNativeEventRef.current,
                            type: event.type,
                            ctrlKey: true,
                            consumed: false,
                        }),
                    )

                    break
            }

            invalidate()
        }

        const onKeyUp = (event: KeyboardEvent) => {
            if (lastNativeEventRef.current === undefined) {
                return
            }

            if (window.document.body.style.cursor !== "default") {
                window.document.body.style.cursor = "default"
            }

            switch (event.code) {
                case "ShiftLeft":
                    onEvent(
                        (lastNativeEventRef.current = {
                            ...lastNativeEventRef.current,
                            type: event.type,
                            shiftKey: false,
                            consumed: false,
                            scroll: 0,
                        }),
                    )

                    break

                case "ControlLeft":
                    onEvent(
                        (lastNativeEventRef.current = {
                            ...lastNativeEventRef.current,
                            type: event.type,
                            ctrlKey: false,
                            consumed: false,
                            scroll: 0,
                        }),
                    )

                    break
            }

            invalidate()
        }

        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)

        const onContextMenu = (event: MouseEvent) => {
            event.preventDefault()
        }

        const onWheel = (event: WheelEvent) => {
            if (lastNativeEventRef.current === undefined) {
                return
            }

            if (window.document.body.style.cursor !== "default") {
                window.document.body.style.cursor = "default"
            }

            onEvent(
                (lastNativeEventRef.current = {
                    ...lastNativeEventRef.current,
                    type: event.type,
                    scroll: event.deltaY,
                    consumed: false,
                }),
            )

            event.stopPropagation()

            invalidate()
        }

        canvas.addEventListener("contextmenu", onContextMenu)
        window.addEventListener("wheel", onWheel)

        return () => {
            canvas.removeEventListener("pointerdown", onPointerEvent)
            canvas.removeEventListener("pointermove", onPointerEvent)
            canvas.removeEventListener("pointerup", onPointerEvent)
            canvas.removeEventListener("pointerleave", onPointerEvent)

            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)

            window.removeEventListener("wheel", onWheel)
            canvas.removeEventListener("contextmenu", onContextMenu)
        }
    }, [canvas, camera, invalidate, onEvent])
}
