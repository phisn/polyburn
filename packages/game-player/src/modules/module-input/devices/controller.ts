export class Keyboard {
    private keyboardLeft = false
    private keyboardRight = false
    private keyboardUpA = false
    private keyboardUpD = false

    private keyboardUpArrow = false
    private keyboardUpW = false
    private keyboardUpSpace = false

    private rotationSpeed = 1.0

    private _rotation = 0
    private _thrust = false

    constructor() {}

    dispose() {}

    rotation() {
        return this._rotation
    }

    thrust() {
        return this._thrust
    }

    setRotationSpeed(speed: number) {
        this.rotationSpeed = speed
    }

    onPreFixedUpdate(delta: number) {
        const [gamepad] = navigator.getGamepads()

        if (!gamepad) {
            return
        }

        if (this.keyboardLeft || this.keyboardUpA) {
            this._rotation += delta * 0.001 * this.rotationSpeed
        }

        if (this.keyboardRight || this.keyboardUpD) {
            this._rotation -= delta * 0.001 * this.rotationSpeed
        }

        this._thrust = this.keyboardUpArrow || this.keyboardUpW || this.keyboardUpSpace
    }
}
