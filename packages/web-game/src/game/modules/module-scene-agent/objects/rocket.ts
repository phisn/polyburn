import { EntityWith } from "runtime-framework"
import { EntityType } from "runtime/proto/world"
import { RuntimeComponents } from "runtime/src/core/runtime-components"
import { entityRegistry } from "runtime/src/model/world/entity-registry"
import * as THREE from "three"
import { AgentColors } from "../colors"
import { Svg } from "../svg"

export class Rocket extends THREE.Object3D {
    constructor(
        public entity: EntityWith<RuntimeComponents, "rigidBody">,
        colors: AgentColors,
    ) {
        super()

        const colorStr = "#" + colors.rocket.toString(16).padStart(6, "0")

        // we do not use the original svg since its too sharp at the bottom
        // and with lower resolution we do not paint any pixels there. therefore
        // we just will the complete lower part
        const svg = new Svg(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 600" height="600" width="300"><path fill="${colorStr}" opacity="1" d=" M 1 502 L 3 355 C 4 344 4 334 5 324 C 7 310 9 297 11 284 C 15 256 23 229 32 202 C 43 169 57 138 74 108 C 87 85 100 62 117 42 L 150 0 L 183 42 C 200 62 213 85 226 108 C 243 138 257 169 268 202 C 277 229 285 256 289 284 C 291 297 293 310 295 324 C 296 334 296 344 297 355 L 299 502 z"/><path fill="${colorStr}" opacity="1" d="M 300 600 L 0 600 L 1 502 L 299 502"/></svg>`,
        )

        const scale = (0.15 * 1) / 25.0
        const rocketEntry = entityRegistry[EntityType.ROCKET]

        svg.scale.set(scale, scale, 1.0)
        svg.rotation.set(0, 0, Math.PI)
        svg.position.set(rocketEntry.width / 2, rocketEntry.height / 2, 1.0)

        this.add(svg)

        this.position.set(
            entity.components.rigidBody.translation().x,
            entity.components.rigidBody.translation().y,
            0,
        )
    }

    onUpdate() {
        this.position.set(
            this.entity.components.rigidBody.translation().x,
            this.entity.components.rigidBody.translation().y,
            0,
        )

        this.rotation.z = this.entity.components.rigidBody.rotation()
    }
}
