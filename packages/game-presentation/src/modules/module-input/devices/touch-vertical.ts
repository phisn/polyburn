import { PresentationStore } from "../../../store"

export class TouchVertical {
    private pointer?: {
        pointerId: number

        startPointerX: number
        startRotation: number
    }

    private _rotationSpeed = 1.0

    private _rotation = 0
    private _thrust = false

    private touchEvents = ["touchstart", "touchend", "touchmove", "touchcancel"] as const

    constructor(private store: PresentationStore) {
        this.onTouchEvent = this.onTouchEvent.bind(this)

        const renderer = this.store.resources.get("renderer")

        for (const ptrEvent of this.touchEvents) {
            renderer.domElement.addEventListener(ptrEvent, this.onTouchEvent, {
                capture: true,
            })
        }
    }

    dispose() {
        const renderer = this.store.resources.get("renderer")

        for (const ptrEvent of this.touchEvents) {
            renderer.domElement.removeEventListener(ptrEvent, this.onTouchEvent)
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
                    if (window.innerWidth > window.innerHeight) {
                        break
                    }

                    if (this.pointer === undefined) {
                        this.pointer = {
                            pointerId: touch.identifier,
                            startPointerX: touchPosition.x,
                            startRotation: this._rotation,
                        }

                        this._thrust = true
                    }

                    break
                case "touchmove":
                    if (this.pointer && this.pointer.pointerId === touch.identifier) {
                        this._rotation =
                            this.pointer.startRotation -
                            (touchPosition.x - this.pointer.startPointerX) * 0.005
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
