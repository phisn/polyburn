import RAPIER from "@dimforge/rapier2d-compat"

import { EntityType } from "../../model/world/EntityType"
import { FlagEntity } from "../../model/world/FlagModel"
import { Point } from "../../model/world/Point"
import { WorldModel } from "../../model/world/WorldModel"
import { ColliderType } from "./ColliderType"
import { createShape } from "./domain/common/RuntimeShape"
import { RuntimeLevel } from "./domain/RuntimeLevel"
import { RuntimeRocket } from "./rocket/RuntimeRocket"
import { RuntimeFutures } from "./RuntimeFutures"

export interface RuntimeMetaState {
    handleToEntityType: Map<number, ColliderType>

    rapier: RAPIER.World
    queue: RAPIER.EventQueue
    futures: RuntimeFutures

    tickRate: number

    // simulate slow clients
    tickRateDelayFactor: number
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

export function createRuntimeState(
    meta: RuntimeMetaState,
    world: WorldModel
) {
    const rocket = new RuntimeRocket(
        meta,
        world
    )

    world.shapes.forEach(
        shape => createShape(meta, shape)
    )

    const flags = world.entities
        .filter(entity => entity.type === EntityType.RedFlag) as FlagEntity[]

    if (flags.length === 0) {
        throw new Error("No flags found")
    }

    const levels = flags.map(
        flag => new RuntimeLevel(meta, flag)
    )

    const firstLevel = findFirstLevel(levels, rocket)
    firstLevel.unlockLevel()

    const state = new RuntimeState(
        levels,
        firstLevel,
        rocket,
        meta
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

export function createMetaState(
    gravityHorizontal: number,
    gravityVertical: number,
    tickRate: number,
    tickRateDelayFactor: number
): RuntimeMetaState {
    const rapier = new RAPIER.World({
        x: gravityHorizontal,
        y: gravityVertical
    })

    return {
        handleToEntityType: new Map<number, ColliderType>(),

        rapier,
        queue: new RAPIER.EventQueue(true),
        futures: new RuntimeFutures,

        tickRate,
        tickRateDelayFactor
    }
}
