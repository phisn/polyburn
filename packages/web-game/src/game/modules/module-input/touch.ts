import { ExtendedRuntime } from "../../runtime-extension/new-extended-runtime"

export class Touch {
    private thrustPointerId?: number

    private rotatePointer?: {
        pointerId: number
        startPointerX: number
        startRotation: number
    }

    private _rotationSpeed = 1.0

    private _rotation = 0
    private _thrust = false

    private touchEvents = ["touchstart", "touchend", "touchmove", "touchcancel"] as const

    constructor(private runtime: ExtendedRuntime) {
        this.onTouchEvent = this.onTouchEvent.bind(this)

        for (const ptrEvent of this.touchEvents) {
            runtime.factoryContext.renderer.domElement.addEventListener(
                ptrEvent,
                this.onTouchEvent,
                { capture: true },
            )
        }
    }

    dispose() {
        for (const ptrEvent of this.touchEvents) {
            this.runtime.factoryContext.renderer.domElement.removeEventListener(
                ptrEvent,
                this.onTouchEvent,
            )
        }
    }

    rotation() {
        return this._rotation
    }

    thrust() {
        return this._thrust
    }

    setRotationSpeed(speed: number) {
        this._rotationSpeed = speed
    }

    private onTouchEvent(event: TouchEvent) {
        for (const touch of event.changedTouches) {
            const touchPosition = {
                x: touch.clientX,
                y: touch.clientY,
            }

            switch (event.type) {
                case "touchstart":
                    console.log(
                        "start with id " + touch.identifier,
                        " and tpid " + this.thrustPointerId,
                        " and rpid " + this.rotatePointer?.pointerId,
                    )

                    if (touchPosition.x > window.innerWidth / 2) {
                        if (this.thrustPointerId === undefined) {
                            ;(this.thrustPointerId = touch.identifier), (this._thrust = true)

                            console.log("thrust start")
                        }
                    } else {
                        if (this.rotatePointer === undefined) {
                            this.rotatePointer = {
                                pointerId: touch.identifier,
                                startPointerX: touchPosition.x,
                                startRotation: this._rotation,
                            }
                        }
                    }

                    break
                case "touchmove":
                    if (this.rotatePointer && this.rotatePointer.pointerId === touch.identifier) {
                        this._rotation =
                            this.rotatePointer.startRotation -
                            (touchPosition.x - this.rotatePointer.startPointerX) * 0.005
                    }

                    break
                case "touchend":
                case "touchcancel":
                    console.log(
                        "cancel with id " + touch.identifier,
                        " and tpid " + this.thrustPointerId,
                        " and rpid " + this.rotatePointer?.pointerId,
                    )

                    if (this.thrustPointerId === touch.identifier) {
                        this._thrust = false
                        this.thrustPointerId = undefined

                        console.log("thrust stop")
                    }

                    if (this.rotatePointer && this.rotatePointer.pointerId === touch.identifier) {
                        this.rotatePointer = undefined
                    }

                    break
                default:
                    console.log(event.type)
            }
        }

        event.preventDefault()
    }
}
