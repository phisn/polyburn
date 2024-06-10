import RAPIER from "@dimforge/rapier2d"
import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"
import { EntityStore, System, SystemStack } from "runtime-framework"
import { EntityType } from "../../../../../proto/world"
import { changeAnchor } from "../../../../model/world/change-anchor"
import { entityRegistry } from "../../../../model/world/entity-registry"
import { CoreComponents } from "../../core-components"
import { CoreEvents, CoreInput } from "../../core-events"
import { WorldComponents, WorldEntity } from "../../world/world-entity"
import { RocketComponents, RocketEntity } from "../rocket-entity"

export class RapierStepSystem implements System<CoreEvents> {
    private rocketEntity: RocketEntity
    private worldEntity: WorldEntity

    private ray: RAPIER.Ray | undefined
    private rayDirection: RAPIER.Vector | undefined

    constructor(entities: EntityStore<CoreComponents>, _systems: SystemStack<CoreEvents>) {
        this.rocketEntity = entities.single(...RocketComponents)
        this.worldEntity = entities.single(...WorldComponents)
    }

    onCoreUpdate(input: CoreInput) {
        this.rocketEntity.rocket.thrusting = input.thrust

        if (input.thrust === false) {
            return
        }

        const force = {
            x: 0,
            y: this.worldEntity.config.thrustValue,
        }

        if (this.rocketGroundRay(rocket.components.rigidBody, config.thrustDistance)) {
            force.x *= config.thrustGroundMultiplier
            force.y *= config.thrustGroundMultiplier
        }

        const rotation = rocket.components.rigidBody.rotation()

        const rotatedForce = {
            x: force.x * cos(rotation) - force.y * sin(rotation),
            y: force.x * sin(rotation) + force.y * cos(rotation),
        }

        this.rocketEntity.rigidBody.applyImpulse(rotatedForce, true)
    }

    private rocketGroundRay(rocket: RAPIER.RigidBody, length: number) {
        const entry = entityRegistry[EntityType.ROCKET]

        const rayStart = changeAnchor(
            rocket.translation(),
            rocket.rotation(),
            entry,
            { x: 0.5, y: 0.5 },
            { x: 0.5, y: 0.2 },
        )

        const rayTarget = changeAnchor(
            rocket.translation(),
            rocket.rotation(),
            entry,
            { x: 0.5, y: 0.5 },
            { x: 0.5, y: -1 },
        )

        if (this.ray === undefined || this.rayDirection === undefined) {
            this.rayDirection = new this.worldEntity.rapier.instance.Vector2(0, 1)

            this.ray = new this.worldEntity.rapier.instance.Ray(
                new this.worldEntity.rapier.instance.Vector2(0, 0),
                new this.worldEntity.rapier.instance.Vector2(0, 1),
            )
        }

        this.rayDirection.x = rayTarget.x - rayStart.x
        this.rayDirection.y = rayTarget.y - rayStart.y

        this.ray.dir = this.rayDirection
        this.ray.origin = rayStart

        return this.worldEntity.rapier.world.castRay(
            this.ray,
            length,
            false,
            undefined,
            0x00_01_00_02,
            undefined,
            rocket,
        )
    }
}
