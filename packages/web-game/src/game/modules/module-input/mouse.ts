import { WebGameStore } from "../../model/store"

// const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

export class Mouse {
    private wasPointerDown = false
    private startPointerX = 0
    private startRotation = 0

    private rotationSpeed = 1.0

    private _rotation = 0
    private _thrust = false

    private ptrEvents = ["pointerdown", "pointerup", "pointermove", "pointercancel"] as const

    constructor(private runtime: WebGameStore) {
        this.onPointerEvent = this.onPointerEvent.bind(this)

        for (const ptrEvent of this.ptrEvents) {
            runtime.renderer.domElement.addEventListener(ptrEvent, this.onPointerEvent, {
                capture: true,
            })
        }
    }

    dispose() {
        for (const ptrEvent of this.ptrEvents) {
            this.runtime.renderer.domElement.removeEventListener(ptrEvent, this.onPointerEvent)
        }
    }

    rotation() {
        return this._rotation
    }

    thrust() {
        return this._thrust
    }

    setRotationSpeed(speed: number) {
        this.rotationSpeed = speed
    }

    private onPointerEvent(event: PointerEvent) {
        if (event.pointerType !== "mouse") {
            return
        }

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
