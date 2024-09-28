import { GamePlayerStore } from "../../../model/store"
import { Keyboard } from "./keyboard"
import { Mouse } from "./mouse"
import { Touch } from "./touch"
import { TouchVertical } from "./touch-vertical"

const CHARCODE_ONE = "1".charCodeAt(0)
const CHARCODE_NINE = "9".charCodeAt(0)

export class Devices {
    private deviceKeyboard: Keyboard
    private deviceMouse: Mouse
    private deviceTouch: Touch
    private deviceTouchVertical: TouchVertical

    private rotationSpeed = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0]
    private rotationSpeedIndex = 2

    constructor(store: GamePlayerStore) {
        this.deviceKeyboard = new Keyboard()
        this.deviceMouse = new Mouse(store)
        this.deviceTouch = new Touch(store)
        this.deviceTouchVertical = new TouchVertical(store)

        window.addEventListener("keydown", event => {
            if (event.repeat) {
                return
            }

            if (
                event.key.charCodeAt(0) >= CHARCODE_ONE &&
                event.key.charCodeAt(0) <= CHARCODE_NINE
            ) {
                this.rotationSpeedIndex = event.key.charCodeAt(0) - CHARCODE_ONE

                this.deviceKeyboard.setRotationSpeed(this.rotationSpeed[this.rotationSpeedIndex])
                this.deviceMouse.setRotationSpeed(this.rotationSpeed[this.rotationSpeedIndex])
            }
        })

        document.addEventListener("contextmenu", event => event.preventDefault())
    }

    onDispose() {
        this.deviceKeyboard.onDispose()
        this.deviceMouse.onDispose()
    }

    onFixedUpdate() {
        this.deviceKeyboard.onFixedUpdate()
    }

    rotation() {
        return (
            this.deviceMouse.rotation() +
            this.deviceKeyboard.rotation() +
            this.deviceTouch.rotation() +
            this.deviceTouchVertical.rotation()
        )
    }

    thrust() {
        return (
            this.deviceMouse.thrust() ||
            this.deviceKeyboard.thrust() ||
            this.deviceTouch.thrust() ||
            this.deviceTouchVertical.thrust()
        )
    }
}
