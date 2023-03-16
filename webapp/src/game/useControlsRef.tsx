import { useEffect, useRef } from "react"

interface ControlsRef {
    thrust: boolean
    rotation: number
    pause: boolean
}

export function useControlsRef() {
    const controlsRef = useRef<ControlsRef>({
        thrust: false,
        rotation: 0,
        pause: false,
    })

    useEffect(() => {
        let wasPointerDown = false
        let startPointerX = 0
        let startRotation = 0

        const onPointerEvent = (event: PointerEvent) => {
            if ((event.buttons & 1) === 1) {
                if (wasPointerDown) {
                    controlsRef.current.rotation =
                        startRotation - (event.clientX - startPointerX) * 0.005
                }
                else {
                    startPointerX = event.clientX
                    wasPointerDown = true
                    startRotation = controlsRef.current.rotation
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

            if (event.key == "p") {
                controlsRef.current.pause = !controlsRef.current.pause
            }
        }

        const onKeyUp = (event: KeyboardEvent) => {
            if (event.key === " ") {
                controlsRef.current.thrust = false
            }
        }

        /*
        setTimeout(() => {
            controlsRef.current.thrust = true
        }, 2000)
        */

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