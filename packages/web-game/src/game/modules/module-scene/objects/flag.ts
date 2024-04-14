import { EntityWith } from "runtime-framework"
import * as THREE from "three"
import { ExtendedComponents } from "../../../runtime-extension/extended-components"
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

    constructor(private levelEntity: EntityWith<ExtendedComponents, "level">) {
        super()

        this.red = prototypeRed.clone()
        this.green = prototypeGreen.clone()

        this.add(this.red)
        this.add(this.green)

        this.green.visible = false

        const scale = (0.15 * 1) / 25.0
        this.position.set(
            levelEntity.components.level.flag.x,
            levelEntity.components.level.flag.y,
            0,
        )
        this.rotation.set(0, 0, levelEntity.components.level.flagRotation)
        this.scale.set(scale, -scale, 1.0)
    }

    onUpdate() {
        const should =
            this.levelEntity.components.level.captured ||
            this.levelEntity.components.level.inCapture

        if (this.isActive !== should) {
            this.isActive = should

            this.red.visible = !should
            this.green.visible = should
        }
    }
}
