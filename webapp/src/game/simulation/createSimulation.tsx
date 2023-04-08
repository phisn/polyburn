import RAPIER from "@dimforge/rapier2d-compat"
import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"
import sqrt from "@stdlib/math/base/special/sqrt"

import { EntityType } from "../../model/world/EntityType"
import { FlagEntity } from "../../model/world/Flag"
import { Point } from "../../model/world/Point"
import { World } from "../../model/world/World"
import { createLevel, LevelModel as SimulationLevel } from "./createLevel"
import { createRocket , SimulationRocket } from "./createRocket"
import { createShape } from "./createShape"
import { rocketGroundRay } from "./rocketGroundRay"
import { UpdateContext as StepContext } from "./UpdateContext"

export class Simulation {
    get levels() { return this._levels }
    get currentLevel() { return this._currentLevel }
    get rapier() { return this._rapier }
    get rocket() { return this._rocket }

    constructor(world: World) {
        this._rapier = new RAPIER.World({ 
            x: this.gravityHorizontal,
            y: this.gravityVertical
        })
    
        const flags = world.entities
            .filter(
                entity => entity.type === EntityType.RedFlag
            ) as FlagEntity[]

        this._levels = flags.map(
            flag => createLevel(this._rapier, flag)
        )

        this._rocket = createRocket(this._rapier, world)

        const firstLevel = this._levels.sort(
            (l1, l2) => {
                const distanceToRocket = (l: Point) =>
                    Math.sqrt(
                        Math.pow(l.x - this._rocket.body.translation().x, 2) +
                    Math.pow(l.y - this._rocket.body.translation().y, 2)
                    )

                return distanceToRocket(l1.flag) - distanceToRocket(l2.flag)
            }
        )[0]

        firstLevel.unlocked = true
        firstLevel.collider.setSensor(false)

        this._currentLevel = firstLevel

        world.shapes.forEach(shape => 
            createShape(shape, this._rapier)
        )
    }

    step(context: StepContext): void {
        if (context.pause) {
            return
        }

        this.handleRocketRotation(context)
        this.handleRocketThrust(context)
        
        this._rapier.step(this._queue)
        this._futures.step()

        this.handleCollisionEvents(context)
        this.handleRocketCollisions()
    }

    private handleRocketRotation(context: StepContext) {
        if (this._rocket.collisionCount > 0) {
            return
        }

        this._rocket.updateInputRotation(context.rotation)
    }

    private handleRocketThrust(context: StepContext) {
        if (context.thrust) {
            const force = {
                x: 0,
                y: this.thrust
            }
        
            if (rocketGroundRay(this._rapier, this._rocket.body)) {
                force.x *= this.thrustGroundMultiplier
                force.y *= this.thrustGroundMultiplier
            }

            const rotation = this._rocket.body.rotation()
        
            const rotatedForce = {
                x: force.x * cos(rotation) - force.y * sin(rotation),
                y: force.x * sin(rotation) + force.y * cos(rotation)
            }

            this._rocket.body.applyImpulse(rotatedForce, true)
        }
    }

    private handleCollisionEvents(context: StepContext) {
        this._queue.drainCollisionEvents((h1, h2, started) => {
            const collider1 = this._rapier.getCollider(h1)
            const collider2 = this._rapier.getCollider(h2)

            if (collider1.parent()?.handle === this._rocket.body.handle) {
                this.handleCollisionEvent(context, collider1, collider2, started)
            }

            else if (collider2.parent()?.handle === this._rocket.body.handle) {
                this.handleCollisionEvent(context, collider2, collider1, started)
            }
        })
    }

    private handleCollisionEvent(
        context: StepContext, 
        rocket: RAPIER.Collider,
        other: RAPIER.Collider,
        started: boolean
    ) {
        if (other.isSensor()) {
            const level = this._levels.find(
                level => level.captureCollider.handle === other.handle
            )

            if (level) {
                this.handleLevelCollisionEvent(context, level, started)
            }
        }
        else {
            if (started) {
                this._rocket.increaseCollisionCount()
            }
            else {
                this._rocket.decreaseCollisionCount()
            }
            
            if (this._rocket.collisionCount === 0) {
                this._rocket.resetInputRotation(context.rotation)
            }
        }
    }

    private handleLevelCollisionEvent(context: StepContext, level: SimulationLevel, started: boolean) {
        if (level.unlocked) {
            return
        }

        if (started === false) {
            if (level === this._rocket.currentLevelCapture) {
                this._rocket.currentLevelCapture = null
            }

            return
        }

        const checkLevelCompletion = () => {
            const linvel = this._rocket.body.linvel()
            const angvel = this._rocket.body.angvel()

            if (level !== this._rocket.currentLevelCapture) {
                return
            }

            const hasVelocity = 
                   Math.abs(linvel.x) > this.levelCompletionVelocityThreshold 
                || Math.abs(linvel.y) > this.levelCompletionVelocityThreshold
                || Math.abs(angvel) > this.levelCompletionVelocityThreshold

            if (hasVelocity) {
                this._futures.add(checkLevelCompletion, this.levelCompletionDelay)
                return
            }
         
            this.completeLevel(level)
        }

        this._futures.add(checkLevelCompletion, this.levelCompletionDelay)
        this._rocket.currentLevelCapture = level
    }

    private completeLevel(level: SimulationLevel) {
        this._currentLevel.collider.setSensor(true)

        level.unlocked = true
        level.collider.setSensor(false)

        this._currentLevel = level
        this._rocket.setSpawn()
    }

    private handleRocketCollisions() {
        if (this._rocket.collisionCount > 0) {
            for (let i = 0; i < this._rocket.body.numColliders(); i++) {
                this._rapier.contactsWith(
                    this._rocket.body.collider(i),
                    (collider) => {
                        if (collider.isSensor()) {
                            return
                        }

                        this._rapier.contactPair(
                            this._rocket.body.collider(i),
                            collider,
                            (contact, flipped) => {
                                this.handleRocketContact(contact, flipped)
                            }
                        )
                    }
                )
            }
        }
    }

    private handleRocketContact(contact: RAPIER.TempContactManifold, flipped: boolean) {
        const upVector = {
            x: -sin(this._rocket.body.rotation()),
            y: cos(this._rocket.body.rotation())
        }

        const otherNormal = flipped
            ? contact.localNormal1()
            : contact.localNormal2()

        const otherNormalLength = sqrt(
            otherNormal.x * otherNormal.x + 
            otherNormal.y * otherNormal.y
        )

        const otherNormalNormalized = {
            x: otherNormal.x / otherNormalLength,
            y: otherNormal.y / otherNormalLength
        }

        const dx = otherNormalNormalized.x - upVector.x
        const dy = otherNormalNormalized.y - upVector.y

        const distance = sqrt(dx * dx + dy * dy)

        if (distance > 0.3) {
            this._rocket.respawn()
        }
    }

    private readonly gravityVertical = -20
    private readonly gravityHorizontal = 0
    
    private readonly thrust = 7.3
    private readonly thrustGroundMultiplier = 1.3

    private readonly levelCompletionDelay = 30
    private readonly levelCompletionVelocityThreshold = 0.01
    
    private _levels: SimulationLevel[]
    private _currentLevel: SimulationLevel
    private _rapier: RAPIER.World
    private _rocket: SimulationRocket

    private _queue: RAPIER.EventQueue = new RAPIER.EventQueue(true)
    private _futures: SimulationFutures = new SimulationFutures()
}

class SimulationFutures {
    add(future: () => void, delay: number) {
        this.futures.push({
            future,
            delay
        })
    }

    step() {
        if (this.futures.length >= 0) {
            this.futures.forEach(future => {
                future.delay -= 1

                if (future.delay <= 0) {
                    future.future()
                }
            })

            this.futures = this.futures.filter(future => future.delay > 0)
        }
    }

    private futures: {
        future: () => void,
        delay: number
    }[] = []
}

export function createSimulation(world: World): Simulation {
    return new Simulation(world)
}
