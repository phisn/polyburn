import { EntityWith } from "runtime-framework"
import { RuntimeComponents } from "runtime/src/core/runtime-components"
import * as THREE from "three"
import { AgentColors } from "../colors"

/*
const prototypeRed = new Svg(
    '<svg xmlns="http://www.w3.org/2000/svg" width="275" height="436"><path style="fill:#dd3322" d="M 16 193 L 275 96 L 16 0 Z"/><path style="fill:#c3c3c3" d="M 0 436 L 16 436 L 16 0 L 0 0 L 0 436 Z"/></svg>',
)

const prototypeGreen = new Svg(
    '<svg xmlns="http://www.w3.org/2000/svg" width="275" height="436"><path style="fill:#0bb101" d="M 16 193 L 275 96 L 16 0 Z"/><path style="fill:#c3c3c3" d="M 0 436 L 16 436 L 16 0 L 0 0 L 0 436 Z"/></svg>',
)
*/

export class Flag extends THREE.Object3D {
    constructor(levelEntity: EntityWith<RuntimeComponents, "level">, colors: AgentColors) {
        super()

        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const materialRed = new THREE.MeshBasicMaterial({ color: colors.flagCaptureRegion })

        const mesh = new THREE.Mesh(geometry, materialRed)

        this.add(mesh)

        this.position.set(
            levelEntity.components.level.capturePosition.x,
            levelEntity.components.level.capturePosition.y +
                levelEntity.components.level.captureSize.y,
            0,
        )

        this.scale.set(
            levelEntity.components.level.captureSize.x * 2,
            levelEntity.components.level.captureSize.y * 2,
            1.0,
        )
    }
}
