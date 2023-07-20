import { useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { Camera, Vector3 } from "three"
import { useEventDispatch } from "./store/EventStore"

export interface NativeEvent {
    positionInWindow: { x: number; y: number }

    leftButtonDown: boolean
    rightButtonDown: boolean

    shiftKey: boolean
    ctrlKey: boolean
}

export interface EditorEvent extends NativeEvent {
    position: Vector3

    leftButtonClicked: boolean
    rightButtonClicked: boolean

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
    const lastNativeEventRef = useRef<NativeEvent | undefined>()

    const canvas = useThree(state => state.gl.domElement)
    const camera = useThree(state => state.camera)

    const dispatchEvent = useEventDispatch()

    useEffect(() => {
        const onPointerEvent = (event: PointerEvent) => {
            onEditorInputChanged({
                positionInWindow: { x: event.clientX, y: event.clientY },
                leftButtonDown: (event.buttons & 1) === 1,
                rightButtonDown: (event.buttons & 2) === 2,

                shiftKey: event.shiftKey,
                ctrlKey: event.ctrlKey,
            })
        }

        const onEditorInputChanged = (nativeEvent: NativeEvent) => {
            const lastNativeEvent = lastNativeEventRef.current ?? nativeEvent

            const event: EditorEvent = {
                ...nativeEvent,

                position: canvasToWorld(
                    nativeEvent.positionInWindow,
                    camera,
                    canvas,
                ),

                leftButtonClicked:
                    nativeEvent.leftButtonDown &&
                    !lastNativeEvent.leftButtonDown,

                rightButtonClicked:
                    nativeEvent.rightButtonDown &&
                    !lastNativeEvent.rightButtonDown,

                consumed: false,
            }

            lastNativeEventRef.current = nativeEvent

            dispatchEvent(event)
        }

        canvas.addEventListener("pointerdown", onPointerEvent)
        canvas.addEventListener("pointermove", onPointerEvent)
        canvas.addEventListener("pointerup", onPointerEvent)

        canvas.addEventListener("contextmenu", event => {
            event.preventDefault()
        })

        return () => {
            canvas.removeEventListener("pointerdown", onPointerEvent)
            canvas.removeEventListener("pointermove", onPointerEvent)
            canvas.removeEventListener("pointerup", onPointerEvent)
        }
    })

    return <></>
}
