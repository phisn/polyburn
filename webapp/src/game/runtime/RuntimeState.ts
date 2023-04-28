import RAPIER from "@dimforge/rapier2d-compat"

import { ColliderType } from "./ColliderType"
import { RuntimeLevel } from "./entity/RuntimeLevel"
import { RuntimeRocket } from "./entity/RuntimeRocket"
import { RuntimeFutures } from "./RuntimeFutures"

export interface RuntimeMetaState {
    handleToEntityType: Map<number, ColliderType>

    rapier: RAPIER.World
    queue: RAPIER.EventQueue
    futures: RuntimeFutures

    tickRate: number
}

export class RuntimeState {
    meta: RuntimeMetaState

    levels: RuntimeLevel[]
    currentLevel: RuntimeLevel

    rocket: RuntimeRocket

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
