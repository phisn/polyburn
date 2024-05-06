import { EntityWith } from "runtime-framework"
import { EntityType } from "runtime/proto/world"
import { RuntimeComponents } from "runtime/src/core/runtime-components"
import { entityRegistry } from "runtime/src/model/world/entity-registry"
import * as THREE from "three"

export class Rocket extends THREE.Object3D {
    constructor(private entity: EntityWith<RuntimeComponents, "rigidBody">) {
        super()

        const rocketEntry = entityRegistry[EntityType.ROCKET]

        const geometry = new THREE.BoxGeometry(rocketEntry.width, rocketEntry.height, 1)
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        const cube = new THREE.Mesh(geometry, material)

        this.add(cube)

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
    }
}
