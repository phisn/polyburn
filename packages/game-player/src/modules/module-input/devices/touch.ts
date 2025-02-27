import { TouchInputModel } from "game/proto/replay"
import { Point } from "game/src/model/utils"
import { GamePlayerStore } from "../../../model/store"

export class Touch {
    private inputChanged: boolean = false
    private thrustPointerId?: number
    private rotatePointer?: {
        pointerId: number
        startPointerX: number
        startRotation: number
    }

    private currentRotatePointer: Point | undefined
    private currentThrustPointer: Point | undefined

    private _rotationSpeed = 1.0

    private _rotation = 0
    private _thrust = false

    private touchEvents = ["touchstart", "touchend", "touchmove", "touchcancel"] as const

    constructor(private store: GamePlayerStore) {
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

    singleReplayInput() {
        return TouchInputModel.create({
            rotationX: this.currentRotatePointer?.x,
            rotationY: this.currentRotatePointer?.y,
            thrustX: this.currentThrustPointer?.x,
            thrustY: this.currentThrustPointer?.y,
        })
    }

    pullInputChanged() {
        if (this.inputChanged) {
            this.inputChanged = false
            return true
        }

        return false
    }

    setRotationSpeed(speed: number) {
        this._rotationSpeed = speed
    }

    private onTouchEvent(event: TouchEvent) {
        this.inputChanged = true

        for (const touch of event.changedTouches) {
            const touchPosition = {
                x: touch.clientX,
                y: touch.clientY,
            }

            switch (event.type) {
                case "touchstart":
                    if (window.innerWidth <= window.innerHeight) {
                        break
                    }

                    console.log(
                        "start with id " + touch.identifier,
                        " and tpid " + this.thrustPointerId,
                        " and rpid " + this.rotatePointer?.pointerId,
                    )

                    if (touchPosition.x > window.innerWidth / 2) {
                        if (this.thrustPointerId === undefined) {
                            this.thrustPointerId = touch.identifier
                            this._thrust = true

                            this.currentThrustPointer = {
                                x: touchPosition.x,
                                y: touchPosition.y,
                            }

                            console.log("thrust start")
                        }
                    } else {
                        if (this.rotatePointer === undefined) {
                            this.rotatePointer = {
                                pointerId: touch.identifier,
                                startPointerX: touchPosition.x,
                                startRotation: this._rotation,
                            }

                            this.currentRotatePointer = {
                                x: touchPosition.x,
                                y: touchPosition.y,
                            }
                        }
                    }

                    break
                case "touchmove":
                    if (this.rotatePointer && touch.identifier === this.rotatePointer.pointerId) {
                        this._rotation =
                            this.rotatePointer.startRotation -
                            (touchPosition.x - this.rotatePointer.startPointerX) * 0.005

                        this.currentRotatePointer = {
                            x: touchPosition.x,
                            y: touchPosition.y,
                        }
                    } else if (touch.identifier === this.thrustPointerId) {
                        this.currentThrustPointer = {
                            x: touchPosition.x,
                            y: touchPosition.y,
                        }
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
                        this.currentThrustPointer = undefined
                    }

                    if (this.rotatePointer && this.rotatePointer.pointerId === touch.identifier) {
                        this.rotatePointer = undefined
                        this.currentRotatePointer = undefined
                    }

                    break
                default:
                    console.log(event.type)
            }
        }

        event.preventDefault()
    }
}
