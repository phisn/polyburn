import RAPIER from "@dimforge/rapier2d-compat"

import { RocketEntity } from "../../model/world/Entity"
import { EntityType } from "../../model/world/EntityType"
import { Point } from "../../model/world/Point"
import { World } from "../../model/world/World"
import { LevelModel } from "./createLevel"
import { createRocketBody } from "./createRocketBody"

export interface RocketSpawn {
    point: Point
    rotation: number
}

export class SimulationRocket {
    currentLevelCapture: LevelModel | null = null

    get body() { return this._body }
    get collisionCount() { return this._collisionCount }

    constructor(
        rapier: RAPIER.World, 
        world: World
    ) {
        const rocket = world.entities.find(
            entity => entity.type === EntityType.Rocket
        ) as RocketEntity | undefined

        if (!rocket) {
            throw new Error("Rocket not found")
        }

        this._body = createRocketBody(rapier, rocket)
        this._rotationNoInput = rocket.rotation

        this.setSpawn()
    }

    resetInputRotation(inputRotation: number) {
        this._rotationNoInput = this._body.rotation() - inputRotation
    }

    updateInputRotation(inputRotation: number) {
        this._body.setRotation(
            this._rotationNoInput + inputRotation,
            true
        )
    }

    increaseCollisionCount() {
        this._collisionCount++
    }

    decreaseCollisionCount() {
        this._collisionCount--

        if (this._collisionCount < 0) {
            console.warn("Collision count is negative")
        }
    }

    respawn() {
        this._body.setTranslation(this._spawn.point, true)
        this._body.setRotation(this._spawn.rotation, true)
        this._body.setLinvel({ x: 0, y: 0 }, true)
        this._body.setAngvel(0, true)
    }

    setSpawn() {
        this._spawn = {
            point: this._body.translation(),
            rotation: this._body.rotation()
        }
    }

    private _body: RAPIER.RigidBody
    private _collisionCount = 0
    private _spawn: RocketSpawn = null!

    // rotation does is not exactly the same as the rocket's body rotation
    // this rotation is before the player input is applied as an offset
    // this is important because input rotation is a delta from beginning of input
    private _rotationNoInput: number
}

export function createRocket(
    rapier: RAPIER.World, 
    world: World
): SimulationRocket {
    return new SimulationRocket(rapier, world)
}
