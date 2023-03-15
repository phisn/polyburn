import { useEffect, useRef } from "react"

interface ControlsRef {
    thrust: boolean
    rotation: number
}

export function useControlsRef() {
    const controlsRef = useRef<ControlsRef>({
        thrust: false,
        rotation: 0,
    })

    useEffect(() => {
        let wasPointerDown = false
        let startPointerX = 0

        const onPointerEvent = (event: PointerEvent) => {
            if ((event.buttons & 1) === 1) {
                if (wasPointerDown) {
                    controlsRef.current.rotation = -(event.clientX - startPointerX) / 100
                }
                else {
                    startPointerX = event.clientX
                    wasPointerDown = true
                }
            }
            else {
                wasPointerDown = false
            }
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === " ") {
                controlsRef.current.thrust = true
            }
        }

        const onKeyUp = (event: KeyboardEvent) => {
            if (event.key === " ") {
                controlsRef.current.thrust = false
            }
        }

        window.addEventListener("pointerdown", onPointerEvent)
        window.addEventListener("pointerup", onPointerEvent)
        window.addEventListener("pointermove", onPointerEvent)

        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)

        return () => {
            window.removeEventListener("pointerdown", onPointerEvent)
            window.removeEventListener("pointerup", onPointerEvent)
            window.removeEventListener("pointermove", onPointerEvent)

            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)
        }
    })

    return controlsRef
}