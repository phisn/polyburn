import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { useRotateScreen } from "../runtime-view/camera/useRotateScreen"

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

    wasPointerDown: boolean
    startPointerX: number
    startRotation: number

    space?: boolean
    shift?: boolean
    w?: boolean
    up?: boolean

    a?: boolean
    left?: boolean

    d?: boolean
    right?: boolean
}

export function useControls() {
    const controlsRef = useRef<ControlsRef>({
        thrust: false,
        rotation: 0,
        pause: false,
    })

    const stateRef = useRef<TouchPointerState | MousePointerState | NonePointerState>({
        type: PointerStateType.None,
    })

    const canvas = useThree().gl.domElement

    const rotated = useRotateScreen()

    console.log("rotated: " + true)

    useFrame((_, delta) => {
        if (stateRef.current.type === PointerStateType.Mouse) {
            const hasLeft = stateRef.current.a || stateRef.current.left
            const hasRight = stateRef.current.d || stateRef.current.right

            if (hasLeft !== hasRight) {
                if (hasLeft) {
                    controlsRef.current.rotation += 1.5 * delta
                } else {
                    controlsRef.current.rotation -= 1.5 * delta
                }
            }
        }
    })

    useEffect(() => {
        const onPointerEvent = (event: PointerEvent) => {
            if (event.pointerType === "mouse") {
                if (stateRef.current.type !== PointerStateType.Mouse) {
                    controlsRef.current.thrust = false

                    stateRef.current = {
                        type: PointerStateType.Mouse,

                        wasPointerDown: false,
                        startPointerX: 0,
                        startRotation: 0,
                    }
                }

                if ((event.buttons & 1) === 1) {
                    if (stateRef.current.wasPointerDown) {
                        controlsRef.current.rotation =
                            stateRef.current.startRotation -
                            (event.clientX - stateRef.current.startPointerX) * 0.005
                    } else {
                        stateRef.current.startPointerX = event.clientX
                        stateRef.current.wasPointerDown = true
                        stateRef.current.startRotation = controlsRef.current.rotation
                    }
                } else {
                    stateRef.current.wasPointerDown = false
                }
            }
        }

        const onTouchEvent = (event: TouchEvent) => {
            if (stateRef.current.type !== PointerStateType.Touch) {
                stateRef.current = {
                    type: PointerStateType.Touch,
                }
            }

            for (const touch of event.changedTouches) {
                let touchPosition

                if (rotated) {
                    touchPosition = {
                        x: touch.clientY,
                        y: window.innerWidth - touch.clientX,
                    }
                } else {
                    touchPosition = {
                        x: touch.clientX,
                        y: touch.clientY,
                    }
                }

                switch (event.type) {
                    case "touchstart":
                        console.log(
                            "start with id " + touch.identifier,
                            " and tpid " + stateRef.current.thrustPointer?.pointerId,
                            " and rpid " + stateRef.current.rotatePointer?.pointerId,
                        )

                        if (touchPosition.x > window.innerWidth / 2) {
                            if (stateRef.current.thrustPointer === undefined) {
                                stateRef.current.thrustPointer = {
                                    pointerId: touch.identifier,
                                }

                                controlsRef.current.thrust = true

                                console.log("thrust start")
                            }
                        } else {
                            if (stateRef.current.rotatePointer === undefined) {
                                stateRef.current.rotatePointer = {
                                    pointerId: touch.identifier,
                                    startPointerX: touchPosition.x,
                                    startRotation: controlsRef.current.rotation,
                                }
                            }
                        }

                        break
                    case "touchmove":
                        if (
                            stateRef.current.rotatePointer &&
                            stateRef.current.rotatePointer.pointerId === touch.identifier
                        ) {
                            controlsRef.current.rotation =
                                stateRef.current.rotatePointer.startRotation -
                                (touchPosition.x - stateRef.current.rotatePointer.startPointerX) *
                                    0.005
                        }

                        break
                    case "touchend":
                    case "touchcancel":
                        console.log(
                            "cancel with id " + touch.identifier,
                            " and tpid " + stateRef.current.thrustPointer?.pointerId,
                            " and rpid " + stateRef.current.rotatePointer?.pointerId,
                        )

                        if (
                            stateRef.current.thrustPointer &&
                            stateRef.current.thrustPointer.pointerId === touch.identifier
                        ) {
                            controlsRef.current.thrust = false
                            stateRef.current.thrustPointer = undefined

                            console.log("thrust stop")
                        }

                        if (
                            stateRef.current.rotatePointer &&
                            stateRef.current.rotatePointer.pointerId === touch.identifier
                        ) {
                            stateRef.current.rotatePointer = undefined
                        }

                        break
                    default:
                        console.log(event.type)
                }
            }

            event.preventDefault()
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (stateRef.current.type !== PointerStateType.Mouse) {
                controlsRef.current.thrust = false

                stateRef.current = {
                    type: PointerStateType.Mouse,

                    wasPointerDown: false,
                    startPointerX: 0,
                    startRotation: 0,
                }
            }

            if (event.key === " ") {
                stateRef.current.space = true
                controlsRef.current.thrust = true
            }

            if (event.key === "Shift") {
                stateRef.current.shift = true
                controlsRef.current.thrust = true
            }

            if (event.key === "w") {
                stateRef.current.w = true
                controlsRef.current.thrust = true
            }

            if (event.key === "ArrowUp") {
                stateRef.current.up = true
                controlsRef.current.thrust = true
            }

            if (event.key === "p") {
                controlsRef.current.pause = !controlsRef.current.pause
            }

            if (event.key === "ArrowLeft") {
                stateRef.current.left = true
            }

            if (event.key === "ArrowRight") {
                stateRef.current.right = true
            }

            if (event.key === "a") {
                stateRef.current.a = true
            }

            if (event.key === "d") {
                stateRef.current.d = true
            }
        }

        const updateThrustAfterKey = () => {
            controlsRef.current.thrust =
                stateRef.current.type === PointerStateType.Mouse &&
                !!(
                    stateRef.current.space ||
                    stateRef.current.shift ||
                    stateRef.current.w ||
                    stateRef.current.up
                )
        }

        const onKeyUp = (event: KeyboardEvent) => {
            if (stateRef.current.type !== PointerStateType.Mouse) {
                controlsRef.current.thrust = false

                stateRef.current = {
                    type: PointerStateType.Mouse,

                    wasPointerDown: false,
                    startPointerX: 0,
                    startRotation: 0,
                }
            }

            if (event.key === " ") {
                stateRef.current.space = false
                updateThrustAfterKey()
            }

            if (event.key === "Shift") {
                stateRef.current.shift = false
                updateThrustAfterKey()
            }

            if (event.key === "w") {
                stateRef.current.w = false
                updateThrustAfterKey()
            }

            if (event.key === "ArrowUp") {
                stateRef.current.up = false
                updateThrustAfterKey()
            }

            if (event.key === "ArrowLeft") {
                stateRef.current.left = false
            }

            if (event.key === "ArrowRight") {
                stateRef.current.right = false
            }

            if (event.key === "a") {
                stateRef.current.a = false
            }

            if (event.key === "d") {
                stateRef.current.d = false
            }
        }

        canvas.addEventListener("pointerdown", onPointerEvent)
        canvas.addEventListener("pointerup", onPointerEvent)
        canvas.addEventListener("pointermove", onPointerEvent)
        canvas.addEventListener("pointercancel", onPointerEvent)

        canvas.addEventListener("touchstart", onTouchEvent)
        canvas.addEventListener("touchend", onTouchEvent)
        canvas.addEventListener("touchmove", onTouchEvent)
        canvas.addEventListener("touchcancel", onTouchEvent)

        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)

        return () => {
            canvas.removeEventListener("pointerdown", onPointerEvent)
            canvas.removeEventListener("pointerup", onPointerEvent)
            canvas.removeEventListener("pointermove", onPointerEvent)
            canvas.removeEventListener("pointercancel", onPointerEvent)

            canvas.removeEventListener("touchstart", onTouchEvent)
            canvas.removeEventListener("touchend", onTouchEvent)
            canvas.removeEventListener("touchmove", onTouchEvent)
            canvas.removeEventListener("touchcancel", onTouchEvent)

            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)
        }
    })

    return controlsRef
}
