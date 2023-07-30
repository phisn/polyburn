import { useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { Camera, Vector3 } from "three"
import { useEventDispatch } from "./store/EventStore"

export interface EditorEvent {
    type: string

    position: Vector3
    positionInGrid: Vector3
    positionInWindow: { x: number; y: number }

    leftButtonDown: boolean
    leftButtonClicked: boolean
    leftButtonReleased: boolean

    rightButtonDown: boolean
    rightButtonClicked: boolean
    rightButtonReleased: boolean

    shiftKey: boolean
    ctrlKey: boolean

    consumed: boolean
}

function canvasToWorld(
    position: { x: number; y: number },
    camera: Camera,
    canvas: HTMLCanvasElement,
) {
    const rect = canvas.getBoundingClientRect()

    const vector = new Vector3(
        ((position.x - rect.left) / canvas.clientWidth) * 2 - 1,
        -((position.y - rect.top) / canvas.clientHeight) * 2 + 1,
        0.5,
    )

    return vector.unproject(camera)
}

export function EventHandler() {
    const lastNativeEventRef = useRef<EditorEvent | undefined>()

    const canvas = useThree(state => state.gl.domElement)
    const camera = useThree(state => state.camera)

    const dispatchEvent = useEventDispatch()

    useEffect(() => {
        const onPointerEvent = (raw: PointerEvent) => {
            console.log("sending event to event handler")
            // cursor is by default "default". other cursors must be a result of this event handler
            if (window.document.body.style.cursor !== "default") {
                window.document.body.style.cursor = "default"
            }

            const position = canvasToWorld({ x: raw.clientX, y: raw.clientY }, camera, canvas)

            const event: EditorEvent = {
                type: raw.type,

                position,
                positionInGrid: new Vector3(
                    Math.round(position.x * 4) * 0.25,
                    Math.round(position.y * 4) * 0.25,
                    0,
                ),
                positionInWindow: { x: raw.clientX, y: raw.clientY },

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

                consumed: false,
            }

            lastNativeEventRef.current = event
            dispatchEvent(event)
        }

        canvas.addEventListener("pointerdown", onPointerEvent)
        canvas.addEventListener("pointermove", onPointerEvent)
        canvas.addEventListener("pointerup", onPointerEvent)

        const onKeyDown = (event: KeyboardEvent) => {
            if (lastNativeEventRef.current === undefined) {
                return
            }

            if (window.document.body.style.cursor !== "default") {
                window.document.body.style.cursor = "default"
            }

            switch (event.code) {
                case "ShiftLeft":
                    dispatchEvent(
                        (lastNativeEventRef.current = {
                            ...lastNativeEventRef.current,
                            shiftKey: true,
                            consumed: false,
                        }),
                    )

                    break

                case "ControlLeft":
                    dispatchEvent(
                        (lastNativeEventRef.current = {
                            ...lastNativeEventRef.current,
                            ctrlKey: true,
                            consumed: false,
                        }),
                    )

                    break
            }
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
                    dispatchEvent(
                        (lastNativeEventRef.current = {
                            ...lastNativeEventRef.current,
                            shiftKey: false,
                            consumed: false,
                        }),
                    )

                    break

                case "ControlLeft":
                    dispatchEvent(
                        (lastNativeEventRef.current = {
                            ...lastNativeEventRef.current,
                            ctrlKey: false,
                            consumed: false,
                        }),
                    )

                    break
            }
        }

        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)

        canvas.addEventListener("contextmenu", event => {
            event.preventDefault()
        })

        return () => {
            canvas.removeEventListener("pointerdown", onPointerEvent)
            canvas.removeEventListener("pointermove", onPointerEvent)
            canvas.removeEventListener("pointerup", onPointerEvent)

            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)
        }
    })

    return <></>
}

