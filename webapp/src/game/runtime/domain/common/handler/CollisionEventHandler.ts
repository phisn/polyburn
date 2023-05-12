import RAPIER from "@dimforge/rapier2d-compat"

import { ColliderType } from "../../../ColliderType"
import { RuntimeState } from "../../../RuntimeState"
import { StepContext } from "../../../StepContext"
import { RuntimeLevel } from "../RuntimeLevel"

export function handleCollisionEvents(runtime: RuntimeState, context: StepContext): void {
    runtime.meta.queue.drainCollisionEvents((h1, h2, started) => {
        const collider1 = runtime.meta.rapier.getCollider(h1)
        const collider2 = runtime.meta.rapier.getCollider(h2)

        const collider1type = runtime.meta.handleToEntityType.get(collider1.parent()?.handle ?? 0)
        const collider2type = runtime.meta.handleToEntityType.get(collider2.parent()?.handle ?? 0)

        if (collider1type === ColliderType.Rocket) {
            handleCollisionEvent(runtime, context, collider2, started)
        }
        else if (collider2type === ColliderType.Rocket) {
            handleCollisionEvent(runtime, context, collider1, started)
        }

        console.log(`Collision between ${collider1type} and ${collider2type}`)
    })
}

function handleCollisionEvent(
    runtime: RuntimeState, 
    context: StepContext,
    other: RAPIER.Collider,
    started: boolean
) {
    const colliderType = runtime.meta.handleToEntityType.get(other.handle)

    if (colliderType === ColliderType.LevelCapture) {
        handleLevelCaptureCollision(runtime, other, context, started)
    }

    if (other.isSensor() === false) {
        handleNonSensorCollision(started, runtime, context)
    }
}

function handleNonSensorCollision(started: boolean, runtime: RuntimeState, context: StepContext) {
    if (started) {
        runtime.rocket.collisionCount++
    }
    else {
        runtime.rocket.collisionCount--
    }

    if (runtime.rocket.collisionCount === 0) {
        runtime.rocket.resetInputRotation(context.rotation)
    }
}

function handleLevelCaptureCollision(runtime: RuntimeState, other: RAPIER.Collider, context: StepContext, started: boolean) {
    const level = runtime.levels.find(
        level => level.captureCollider.handle === other.handle
    )

    level && handleLevelCaptureCollisionEvent(
        runtime,
        context,
        level,
        started
    )
}

function handleLevelCaptureCollisionEvent(
    runtime: RuntimeState, 
    context: StepContext,
    level: RuntimeLevel, 
    started: boolean
) {
    if (level.captured) {
        return
    }

    if (started === false) {
        if (level === runtime.rocket.currentLevelCapture) {
            runtime.rocket.currentLevelCapture = null
        }

        return
    }

    const checkLevelCompletion = () => {
        const linvel = runtime.rocket.body.linvel()
        const angvel = runtime.rocket.body.angvel()

        if (level !== runtime.rocket.currentLevelCapture) {
            return
        }

        const hasVelocity = 
               Math.abs(linvel.x) > levelCompletionVelocityThreshold 
            || Math.abs(linvel.y) > levelCompletionVelocityThreshold
            || Math.abs(angvel) > levelCompletionVelocityThreshold

        if (hasVelocity) {
            runtime.meta.futures.add(checkLevelCompletion, levelCompletionDelay)
            return
        }
     
        runtime.captureLevel(level)
    }

    runtime.meta.futures.add(checkLevelCompletion, levelCompletionDelay)
    runtime.rocket.currentLevelCapture = level
}

const levelCompletionDelay = 30
const levelCompletionVelocityThreshold = 0.01
