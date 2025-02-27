import { MouseInputModel } from "game/proto/replay"
import { GamePlayerStore } from "../../../model/store"

// const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

export class Mouse {
    private inputChanged = false
    private rotationSpeed = 1.0

    private startPointerX = 0
    private startRotation = 0
    private wasPointerDown = false

    private _rotation = 0
    private _thrust = false

    private ptrEvents = ["pointerdown", "pointerup", "pointermove", "pointercancel"] as const

    public x = 0
    public y = 0

    constructor(private store: GamePlayerStore) {
        this.onPointerEvent = this.onPointerEvent.bind(this)

        const renderer = this.store.resources.get("renderer")

        for (const ptrEvent of this.ptrEvents) {
            renderer.domElement.addEventListener(ptrEvent, this.onPointerEvent, {
                capture: true,
            })
        }
    }

    onDispose() {
        const renderer = this.store.resources.get("renderer")

        for (const ptrEvent of this.ptrEvents) {
            renderer.domElement.removeEventListener(ptrEvent, this.onPointerEvent)
        }
    }

    rotation() {
        return this._rotation
    }

    thrust() {
        return this._thrust
    }

    singleReplayInput() {
        return MouseInputModel.create({
            down: this.wasPointerDown,
            x: this.x,
            y: this.y,
            thrust: this._thrust,
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
        this.rotationSpeed = speed
    }

    private onPointerEvent(event: PointerEvent) {
        this.x = event.clientX
        this.y = event.clientY

        if (event.pointerType !== "mouse") {
            return
        }

        this.inputChanged = true

        if ((event.buttons & 1) === 1) {
            if (this.wasPointerDown) {
                this._rotation =
                    this.startRotation -
                    (event.clientX - this.startPointerX) * 0.005 * this.rotationSpeed
            } else {
                /*
                if (
                    false &&
                    !isSafari &&
                    this.runtime.factoryContext.renderer.domElement.requestPointerLock
                ) {
                    this.runtime.factoryContext.renderer.domElement.style.cursor = "none"

                    const requestPointerLock = this.runtime.factoryContext.renderer.domElement
                        .requestPointerLock as any

                    // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
                    requestPointerLock({
                        unadjustedMovement: true,
                    })
                }
                */

                this.wasPointerDown = true
                this.startPointerX = event.clientX
                this.startRotation = this._rotation
            }
        } else {
            /*
            if (this.wasPointerDown) {
                if (false && !isSafari && document.exitPointerLock) {
                    document.exitPointerLock()
                    this.runtime.factoryContext.renderer.domElement.style.cursor = "auto"
                }
            }
            */

            this.wasPointerDown = false
        }

        this._thrust = (event.buttons & 2) === 2
    }
}
