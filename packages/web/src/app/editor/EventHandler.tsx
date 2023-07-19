import { useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { Camera, Vector3 } from "three"
import { useEventDispatch } from "./store/EventStore"

export interface NativeEvent {
    positionInWindow: { x: number; y: number }
    leftButton: boolean
}

export interface EditorEvent {
    position: Vector3
    clicked: boolean
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
            console.log("pointer event", event.buttons)
            onEditorInputChanged({
                positionInWindow: { x: event.clientX, y: event.clientY },
                leftButton: (event.buttons & 1) === 1,
            })
        }

        const onEditorInputChanged = (nativeEvent: NativeEvent) => {
            const lastNativeEvent = lastNativeEventRef.current ?? nativeEvent

            const event: EditorEvent = {
                position: canvasToWorld(
                    nativeEvent.positionInWindow,
                    camera,
                    canvas,
                ),
                clicked: nativeEvent.leftButton && !lastNativeEvent.leftButton,
            }

            console.log(
                `nlb: ${nativeEvent.leftButton}, llb: ${lastNativeEvent.leftButton}, clicked: ${event.clicked}`,
            )

            lastNativeEventRef.current = nativeEvent

            dispatchEvent(event)
        }

        canvas.addEventListener("pointerdown", onPointerEvent)
        canvas.addEventListener("pointermove", onPointerEvent)
        canvas.addEventListener("pointerup", onPointerEvent)

        return () => {
            canvas.removeEventListener("pointerdown", onPointerEvent)
            canvas.removeEventListener("pointermove", onPointerEvent)
            canvas.removeEventListener("pointerup", onPointerEvent)
        }
    })

    return <></>
}

