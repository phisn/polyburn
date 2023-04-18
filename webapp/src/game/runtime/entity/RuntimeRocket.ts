import RAPIER from "@dimforge/rapier2d-compat"

import { RocketEntityModel } from "../../../model/world/EntityModel"
import { EntityType } from "../../../model/world/EntityType"
import { Point } from "../../../model/world/Point"
import { WorldModel } from "../../../model/world/WorldModel"
import { ColliderType } from "../ColliderType"
import { RuntimeMetaState } from "../RuntimeState"
import { RuntimeLevel } from "./RuntimeLevel"
import { createRocketEntityBody } from "./RuntimeRocketBody"

export interface RocketSpawn {
    point: Point
    rotation: number
}

export function bodyRotationFromInput(
    rocket: RuntimeRocket, 
    inputRotation: number)
{
    return rocket.rotationNoInput + inputRotation
}

export class RuntimeRocket {
    currentLevelCapture: RuntimeLevel | null = null
    collisionCount = 0

    body: RAPIER.RigidBody
    spawn: RocketSpawn = null!
    rotationNoInput: number

    constructor(
        state: RuntimeMetaState,
        world: WorldModel
    ) {        
        const rocket = world.entities.find(
            entity => entity.type === EntityType.Rocket
        ) as RocketEntityModel | undefined

        if (!rocket) {
            throw new Error("Rocket not found")
        }

        this.body = createRocketEntityBody(state.rapier, rocket)
        this.rotationNoInput = rocket.rotation

        this.spawn = {
            point: this.body.translation(),
            rotation: this.body.rotation()
        }

        state.handleToEntityType.set(this.body.handle, ColliderType.Rocket)
    }

    setSpawn() {
        this.spawn = {
            point: this.body.translation(),
            rotation: this.body.rotation()
        }
    }

    updateBodyRotation(inputRotation: number) {
        this.body.setRotation(
            this.rotationNoInput + inputRotation,
            true
        )
    }

    resetInputRotation(inputRotation: number) {
        this.rotationNoInput = this.body.rotation() - inputRotation
    }

    respawn() {
        this.body.setTranslation(this.spawn.point, true)
        this.body.setRotation(this.spawn.rotation, true)

        this.body.setLinvel({ x: 0, y: 0 }, true)
        this.body.setAngvel(0, true)
    }
}
