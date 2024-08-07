import { ExtendedRuntime } from "../../runtime-extension/new-extended-runtime"

export class TouchAlt {
    private pointer?: {
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
                    if (this.pointer === undefined) {
                        this.pointer = {
                            pointerId: touch.identifier,
                            startPointerX: touchPosition.x,
                            startRotation: this._rotation,
                        }

                        if (touchPosition.y <= window.innerHeight * 0.75) {
                            this._thrust = true
                        }
                    }

                    break
                case "touchmove":
                    if (this.pointer && this.pointer.pointerId === touch.identifier) {
                        this._rotation =
                            this.pointer.startRotation -
                            (touchPosition.x - this.pointer.startPointerX) * 0.005

                        this._thrust = touchPosition.y <= window.innerHeight * 0.75
                    }

                    break
                case "touchend":
                    if (this.pointer && this.pointer.pointerId === touch.identifier) {
                        this.pointer = undefined
                        this._thrust = false
                    }

                    break
                default:
                    console.log(event.type)
            }
        }

        event.preventDefault()
    }
}
