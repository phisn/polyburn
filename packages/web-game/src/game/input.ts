export class Input {
    private keyboardLeft = false
    private keyboardRight = false
    private keyboardUp = false

    private _rotation = 0
    private _thrust = false

    constructor() {
        this.onKeyDown = this.onKeyDown.bind(this)
        this.onKeyUp = this.onKeyUp.bind(this)

        window.addEventListener("keydown", this.onKeyDown)
        window.addEventListener("keyup", this.onKeyUp)
    }

    dispose() {
        window.removeEventListener("keydown", this.onKeyDown)
        window.removeEventListener("keyup", this.onKeyUp)
    }

    rotation() {
        return this._rotation
    }

    thrust() {
        return this._thrust
    }

    onPreFixedUpdate(delta: number) {
        if (this.keyboardLeft) {
            this._rotation += delta * 0.001
        }

        if (this.keyboardRight) {
            this._rotation -= delta * 0.001
        }

        this._thrust = this.keyboardUp
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
                this.keyboardUp = true
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
                this.keyboardUp = false
                break
        }
    }
}
