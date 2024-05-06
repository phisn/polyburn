import { ExtendedRuntime } from "../../runtime-extension/new-extended-runtime"
import { Keyboard } from "./keyboard"
import { Mouse } from "./mouse"

const CHARCODE_ONE = "1".charCodeAt(0)
const CHARCODE_NINE = "9".charCodeAt(0)

export class ModuleInput {
    private keyboard: Keyboard
    private mouse: Mouse

    private rotationSpeed = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0]
    private rotationSpeedIndex = 2

    constructor(runtime: ExtendedRuntime) {
        this.keyboard = new Keyboard()
        this.mouse = new Mouse(runtime)

        this.onContextMenu = this.onContextMenu.bind(this)
        document.addEventListener("contextmenu", this.onContextMenu)

        this.onKeyboardDown = this.onKeyboardDown.bind(this)
        window.addEventListener("keydown", this.onKeyboardDown)
    }

    dispose() {
        this.keyboard.dispose()
        this.mouse.dispose()

        document.removeEventListener("contextmenu", this.onContextMenu)
        window.removeEventListener("keydown", this.onKeyboardDown)
    }

    rotation() {
        return this.mouse.rotation() + this.keyboard.rotation()
    }

    thrust() {
        return this.mouse.thrust() || this.keyboard.thrust()
    }

    onPreFixedUpdate(delta: number) {
        this.keyboard.onPreFixedUpdate(delta)
    }

    onKeyboardDown(event: KeyboardEvent) {
        if (event.repeat) {
            return
        }

        if (event.key.charCodeAt(0) >= CHARCODE_ONE && event.key.charCodeAt(0) <= CHARCODE_NINE) {
            this.rotationSpeedIndex = event.key.charCodeAt(0) - CHARCODE_ONE

            this.keyboard.setRotationSpeed(this.rotationSpeed[this.rotationSpeedIndex])
            this.mouse.setRotationSpeed(this.rotationSpeed[this.rotationSpeedIndex])
        }
    }

    private onContextMenu(event: Event) {
        event.preventDefault()
    }
}
