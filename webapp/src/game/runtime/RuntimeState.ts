import RAPIER from "@dimforge/rapier2d-compat"

import { EntityType } from "../../model/world/EntityType"
import { FlagEntity } from "../../model/world/FlagModel"
import { Point } from "../../model/world/Point"
import { WorldModel } from "../../model/world/WorldModel"
import { ColliderType } from "./ColliderType"
import { RuntimeLevel } from "./entity/RuntimeLevel"
import { RuntimeRocket } from "./entity/RuntimeRocket"
import { createShape } from "./entity/RuntimeShape"
import { RuntimeFutures } from "./RuntimeFutures"

export interface RuntimeMetaState {
    handleToEntityType: Map<number, ColliderType>

    rapier: RAPIER.World
    queue: RAPIER.EventQueue
    futures: RuntimeFutures

    tickRate: number

    // simulate slow clients
    tickRateLag: number
}

export class RuntimeState {
    meta: RuntimeMetaState

    levels: RuntimeLevel[]
    currentLevel: RuntimeLevel

    rocket: RuntimeRocket
    particles: RAPIER.RigidBody[] = []

    constructor(
        levels: RuntimeLevel[],
        firstLevel: RuntimeLevel,
        rocket: RuntimeRocket,
        meta: RuntimeMetaState
    ) {
        this.levels = levels
        this.currentLevel = firstLevel
        this.rocket = rocket
        this.meta = meta
    }

    captureLevel(level: RuntimeLevel) {
        this.currentLevel.boundsCollider.setSensor(true)

        level.captured = true
        level.boundsCollider.setSensor(false)

        this.currentLevel = level

        this.rocket.setSpawn()
    }
}

export function createRuntimeState(world: WorldModel) {
    const metaState = createMetaState()

    const rocket = new RuntimeRocket(
        metaState,
        world
    )

    world.shapes.forEach(
        shape => createShape(metaState, shape)
    )

    const flags = world.entities
        .filter(entity => entity.type === EntityType.RedFlag) as FlagEntity[]

    if (flags.length === 0) {
        throw new Error("No flags found")
    }

    const levels = flags.map(
        flag => new RuntimeLevel(metaState, flag)
    )

    const firstLevel = findFirstLevel(levels, rocket)
    firstLevel.unlockLevel()

    const state = new RuntimeState(
        levels,
        firstLevel,
        rocket,
        metaState
    )

    return state
}

function findFirstLevel(levels: RuntimeLevel[], rocket: RuntimeRocket) {
    const distanceToRocket = (l: Point) =>
        Math.sqrt(
            Math.pow(l.x - rocket.body.translation().x, 2) +
            Math.pow(l.y - rocket.body.translation().y, 2)
        )

    let level: RuntimeLevel | undefined = levels[0]
    let levelDistance = distanceToRocket(level.flag)

    for (let i = 1; i < levels.length; i++) {
        const currentLevel = levels[i]
        const currentLevelDistance = distanceToRocket(currentLevel.flag)

        if (currentLevelDistance < levelDistance) {
            level = currentLevel
            levelDistance = currentLevelDistance
        }
    }

    return level
}

function createMetaState(): RuntimeMetaState {
    const rapier = new RAPIER.World({
        x: this.gravityHorizontal,
        y: this.gravityVertical
    })

    return {
        handleToEntityType: new Map<number, ColliderType>(),

        rapier,
        queue: new RAPIER.EventQueue(true),
        futures: new RuntimeFutures,

        tickRate: this.tickRate,
        tickRateLag: this.tickRateLag
    }
}
