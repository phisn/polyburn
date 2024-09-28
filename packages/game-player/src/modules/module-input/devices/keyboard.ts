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

    constructor() {
        this.onKeyDown = this.onKeyDown.bind(this)
        this.onKeyUp = this.onKeyUp.bind(this)

        window.addEventListener("keydown", this.onKeyDown)
        window.addEventListener("keyup", this.onKeyUp)
    }

    onDispose() {
        window.removeEventListener("keydown", this.onKeyDown)
        window.removeEventListener("keyup", this.onKeyUp)
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

    onFixedUpdate() {
        if (this.keyboardLeft || this.keyboardUpA) {
            this._rotation += 0.001 * 0.16 * this.rotationSpeed
        }

        if (this.keyboardRight || this.keyboardUpD) {
            this._rotation -= 0.001 * 0.16 * this.rotationSpeed
        }

        this._thrust = this.keyboardUpArrow || this.keyboardUpW || this.keyboardUpSpace
    }

    private onKeyDown(event: KeyboardEvent) {
        switch (event.key) {
            case "ArrowLeft":
                this.keyboardLeft = true
                break
            case "ArrowRight":
                this.keyboardRight = true
                break
            case "ArrowUp":
                this.keyboardUpArrow = true
                break
            case "w":
                this.keyboardUpW = true
                break
            case "a":
                this.keyboardUpA = true
                break
            case "d":
                this.keyboardUpD = true
                break
            case " ":
                this.keyboardUpSpace = true
                break
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        switch (event.key) {
            case "ArrowLeft":
                this.keyboardLeft = false
                break
            case "ArrowRight":
                this.keyboardRight = false
                break
            case "ArrowUp":
                this.keyboardUpArrow = false
                break
            case "w":
                this.keyboardUpW = false
                break
            case "a":
                this.keyboardUpA = false
                break
            case "d":
                this.keyboardUpD = false
                break
            case " ":
                this.keyboardUpSpace = false
                break
        }
    }
}
