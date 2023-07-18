import { useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { Camera, Vector3 } from "three"

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
    const vector = new Vector3(
        (position.x / canvas.clientWidth) * 2 - 1,
        -(position.y / canvas.clientHeight) * 2 + 1,
        0.5,
    )

    return vector.unproject(camera)
}

export function EventHandler() {
    const lastNativeEventRef = useRef<NativeEvent | undefined>()

    const canvas = useThree(state => state.gl.domElement)
    const camera = useThree(state => state.camera)

    useEffect(() => {
        const onPointerEvent = (event: PointerEvent) => {
            onEditorInputChanged({
                positionInWindow: { x: event.clientX, y: event.clientY },
                leftButton: (event.button & 1) === 1,
            })
        }

        const onEditorInputChanged = (nativeEvent: NativeEvent) => {
            const lastNativeEvent = lastNativeEventRef.current ?? nativeEvent

            const event: Event = {
                position: canvasToWorld(
                    nativeEvent.positionInWindow,
                    camera,
                    canvas,
                ),
                clicked: nativeEvent.leftButton && !lastNativeEvent.leftButton,
            }
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

