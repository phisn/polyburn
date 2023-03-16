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
        let startRotation = 0

        const onPointerEvent = (event: PointerEvent) => {
            if ((event.buttons & 1) === 1) {
                if (wasPointerDown) {
                    controlsRef.current.rotation =
                        startRotation - (event.clientX - startPointerX) * 0.005

                    console.log(`cx: ${event.clientX}, sx: ${startPointerX}, r: ${controlsRef.current.rotation}`)
                }
                else {
                    console.log("pointer down")

                    startPointerX = event.clientX
                    wasPointerDown = true
                    startRotation = controlsRef.current.rotation
                }
            }
            else {
                if (wasPointerDown) {
                    console.log("pointer up")
                }

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