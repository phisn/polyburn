import { useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { Camera, Vector3 } from "three"
import { useEventDispatch } from "./store/EventStore"

export interface EditorEvent {
    position: Vector3
    positionInWindow: { x: number; y: number }

    leftButtonDown: boolean
    rightButtonDown: boolean

    leftButtonClicked: boolean
    rightButtonClicked: boolean

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
            if (raw.type === "pointerdown") {
                canvas.setPointerCapture(raw.pointerId)
            } else if (raw.type === "pointerup") {
                canvas.releasePointerCapture(raw.pointerId)
            }

            const event: EditorEvent = {
                position: canvasToWorld(
                    { x: raw.clientX, y: raw.clientY },
                    camera,
                    canvas,
                ),
                positionInWindow: { x: raw.clientX, y: raw.clientY },

                leftButtonDown: (raw.buttons & 1) === 1,
                rightButtonDown: (raw.buttons & 2) === 2,

                leftButtonClicked:
                    raw.type === "pointerdown" && (raw.buttons & 1) === 1,
                rightButtonClicked:
                    raw.type === "pointerdown" && (raw.buttons & 2) === 2,

                shiftKey: raw.shiftKey,
                ctrlKey: raw.ctrlKey,

                consumed:
                    raw.target instanceof Node && canvas.contains(raw.target),
            }

            lastNativeEventRef.current = event
            dispatchEvent(event)
        }

        window.addEventListener("pointerdown", onPointerEvent)
        window.addEventListener("pointermove", onPointerEvent)
        window.addEventListener("pointerup", onPointerEvent)

        const onKeyDown = (event: KeyboardEvent) => {
            if (lastNativeEventRef.current === undefined) {
                return
            }

            switch (event.code) {
                case "ShiftLeft":
                    dispatchEvent(
                        (lastNativeEventRef.current = {
                            ...lastNativeEventRef.current,
                            shiftKey: true,
                        }),
                    )

                    break

                case "ControlLeft":
                    dispatchEvent(
                        (lastNativeEventRef.current = {
                            ...lastNativeEventRef.current,
                            ctrlKey: true,
                        }),
                    )

                    break
            }
        }

        const onKeyUp = (event: KeyboardEvent) => {
            if (lastNativeEventRef.current === undefined) {
                return
            }

            switch (event.code) {
                case "ShiftLeft":
                    dispatchEvent(
                        (lastNativeEventRef.current = {
                            ...lastNativeEventRef.current,
                            shiftKey: false,
                        }),
                    )

                    break

                case "ControlLeft":
                    dispatchEvent(
                        (lastNativeEventRef.current = {
                            ...lastNativeEventRef.current,
                            ctrlKey: false,
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
