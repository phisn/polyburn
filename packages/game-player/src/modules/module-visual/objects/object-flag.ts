import { Transform } from "game/src/model/utils"
import * as THREE from "three"
import { Svg } from "../svg"

const prototypeRed = new Svg(
    '<svg xmlns="http://www.w3.org/2000/svg" width="275" height="436"><path style="fill:#dd3322" d="M 16 193 L 275 96 L 16 0 Z"/><path style="fill:#c3c3c3" d="M 0 436 L 16 436 L 16 0 L 0 0 L 0 436 Z"/></svg>',
)

const prototypeGreen = new Svg(
    '<svg xmlns="http://www.w3.org/2000/svg" width="275" height="436"><path style="fill:#0bb101" d="M 16 193 L 275 96 L 16 0 Z"/><path style="fill:#c3c3c3" d="M 0 436 L 16 436 L 16 0 L 0 0 L 0 436 Z"/></svg>',
)

export class Flag extends THREE.Object3D {
    private isActive = false

    private red: Svg
    private green: Svg

    constructor(transform: Transform) {
        super()

        this.red = prototypeRed.clone()
        this.green = prototypeGreen.clone()

        this.add(this.red)
        this.add(this.green)

        this.green.visible = false

        const scale = (0.15 * 1) / 25.0
        this.position.set(transform.point.x, transform.point.y, 0)
        this.rotation.set(0, 0, transform.rotation)
        this.scale.set(scale, -scale, 1.0)
    }

    setActive(active: boolean) {
        this.red.visible = !active
        this.green.visible = active
    }
}
