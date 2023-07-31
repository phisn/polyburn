import { useEffect, useRef } from "react"

interface ControlsRef {
    thrust: boolean
    rotation: number
    pause: boolean
}

enum PointerStateType {
    None,
    Touch,
    Mouse,
}

interface NonePointerState {
    type: PointerStateType.None
}

interface TouchThrustPointer {
    pointerId: number
}

interface TouchRotatePointer {
    pointerId: number
    startPointerX: number
    startRotation: number
}

interface TouchPointerState {
    type: PointerStateType.Touch
    thrustPointer?: TouchThrustPointer
    rotatePointer?: TouchRotatePointer
}

interface MousePointerState {
    type: PointerStateType.Mouse
    startPointerX: number
    startRotation: number
}

export function useControls() {
    const controlsRef = useRef<ControlsRef>({
        thrust: false,
        rotation: 0,
        pause: false,
    })

    useEffect(() => {
        let state: TouchPointerState | MousePointerState | NonePointerState = {
            type: PointerStateType.None,
        }

        let wasPointerDown = false
        let startPointerX = 0
        let startRotation = 0

        const onPointerEvent = (event: PointerEvent) => {
            if (event.pointerType === "touch") {
                if (state.type !== PointerStateType.Touch) {
                    state = {
                        type: PointerStateType.Touch,
                    }
                }

                switch (event.type) {
                    case "pointerdown":
                        if (event.clientX > window.innerWidth / 2) {
                            state.thrustPointer = {
                                pointerId: event.pointerId,
                            }

                            controlsRef.current.thrust = true
                        } else {
                            state.rotatePointer = {
                                pointerId: event.pointerId,
                                startPointerX: event.clientX,
                                startRotation: controlsRef.current.rotation,
                            }
                        }

                        break
                    case "pointermove":
                        if (
                            state.rotatePointer &&
                            state.rotatePointer.pointerId === event.pointerId
                        ) {
                            controlsRef.current.rotation =
                                state.rotatePointer.startRotation -
                                (event.clientX - state.rotatePointer.startPointerX) * 0.005
                        }

                        break
                    case "pointerup":
                    case "pointercancel":
                        if (
                            state.thrustPointer &&
                            state.thrustPointer.pointerId === event.pointerId
                        ) {
                            controlsRef.current.thrust = false
                            state.thrustPointer = undefined
                        }

                        if (
                            state.rotatePointer &&
                            state.rotatePointer.pointerId === event.pointerId
                        ) {
                            state.rotatePointer = undefined
                        }

                        break
                    default:
                        console.log(event.type)
                }
            } else {
                if ((event.buttons & 1) === 1) {
                    if (wasPointerDown) {
                        controlsRef.current.rotation =
                            startRotation - (event.clientX - startPointerX) * 0.005
                    } else {
                        startPointerX = event.clientX
                        wasPointerDown = true
                        startRotation = controlsRef.current.rotation
                    }
                } else {
                    wasPointerDown = false
                }
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
        window.addEventListener("pointercancel", onPointerEvent)

        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)

        return () => {
            window.removeEventListener("pointerdown", onPointerEvent)
            window.removeEventListener("pointerup", onPointerEvent)
            window.removeEventListener("pointermove", onPointerEvent)
            window.removeEventListener("pointercancel", onPointerEvent)

            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)
        }
    })

    return controlsRef
}
