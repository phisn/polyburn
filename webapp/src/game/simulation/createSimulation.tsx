import RAPIER from "@dimforge/rapier2d-compat"
import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"

import { EntityType } from "../../model/world/EntityType"
import { FlagEntity } from "../../model/world/Flag"
import { Point } from "../../model/world/Point"
import { World } from "../../model/world/World"
import { createLevel, LevelModel } from "./createLevel"
import { createRocket , SimulationRocket } from "./createRocket"
import { createShape } from "./createShape"
import { rocketGroundRay } from "./rocketGroundRay"
import { UpdateContext as StepContext } from "./StepContext"

export interface Simulation {
    levels: LevelModel[],
    currentLevel: LevelModel,

    rapier: RAPIER.World

    rocket: SimulationRocket

    step(context: StepContext): void
}

export function createSimulation(world: World): Simulation {
    const rapier = new RAPIER.World({ x: 0.0, y: -20 })
    
    const flags = world.entities
        .filter(
            entity => entity.type === EntityType.RedFlag
        ) as FlagEntity[]

    const levels = flags.map(
        flag => createLevel(rapier, flag)
    )

    const rocket = createRocket(rapier, world)

    const firstLevel = levels.sort(
        (l1, l2) => {
            const distanceToRocket = (l: Point) =>
                Math.sqrt(
                    Math.pow(l.x - rocket.body.translation().x, 2) +
                    Math.pow(l.y - rocket.body.translation().y, 2)
                )

            return distanceToRocket(l1.flag) - distanceToRocket(l2.flag)
        }
    )[0]

    firstLevel.unlocked = true
    firstLevel.collider.setEnabled(true)

    world.shapes.forEach(shape => 
        createShape(shape, rapier)
    )

    const queue = new RAPIER.EventQueue(true)

    return {
        levels,
        currentLevel: firstLevel,

        rapier,
        rocket,

        step: function(context: StepContext) {
            if (context.pause) {
                return
            }

            if (rocket.collisionCount === 0) {
                rocket.body.setRotation(
                    rocket.rotation + context.rotation,
                    true
                )
            }
            
            if (context.thrust) {
                const force = {
                    x: 0,
                    y: 7.3
                }
            
                if (rocketGroundRay(rapier, rocket.body)) {
                    force.x *= 1.3
                    force.y *= 1.3
                }

                const rotation = rocket.body.rotation()
            
                const rotatedForce = {
                    x: force.x * cos(rotation) - force.y * sin(rotation),
                    y: force.x * sin(rotation) + force.y * cos(rotation)
                }

                rocket.body.applyImpulse(rotatedForce, true)
            }

            rapier.step(queue)

            queue.drainCollisionEvents((h1, h2, started) => {
                const handleCollision = (other: RAPIER.Collider) => {
                    if (other.isSensor()) {
                        const level = levels.find(
                            level => level.captureCollider.handle === other.handle
                        )

                        if (level && level.unlocked === false) {
                            this.currentLevel.collider.setEnabled(false)

                            level.unlocked = true
                            level.collider.setEnabled(true)

                            this.currentLevel = level
                        }
                    }
                    else {
                        rocket.collisionCount += started ? 1 : -1
                        
                        if (rocket.collisionCount === 0) {
                            rocket.rotation = rocket.body.rotation() - context.rotation
                        }
                    }
                }

                const collider1 = rapier.getCollider(h1)
                const collider2 = rapier.getCollider(h2)

                if (collider1.parent()?.handle === rocket.body.handle) {
                    handleCollision(collider2)
                }
                else if (collider2.parent()?.handle === rocket.body.handle) {
                    handleCollision(collider1)
                }
            })
        },
    }
}
