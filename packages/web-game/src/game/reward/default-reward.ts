import { EntityWith, MessageCollector } from "runtime-framework"
import { LevelCapturedMessage } from "runtime/src/core/level-capture/level-captured-message"
import { RocketDeathMessage } from "runtime/src/core/rocket/rocket-death-message"
import { RuntimeComponents } from "runtime/src/core/runtime-components"
import { Runtime } from "runtime/src/runtime"

export interface Reward {
    next: (steps: () => void) => [number, boolean]
}

export type RewardFactory = (game: Runtime) => Reward

export class DefaultGameReward implements Reward {
    private captureCollector: MessageCollector<LevelCapturedMessage>
    private deathCollector: MessageCollector<RocketDeathMessage>

    private rocket: EntityWith<RuntimeComponents, "rocket" | "rigidBody">
    private nextLevel: EntityWith<RuntimeComponents, "level">

    private previousDistanceToLevel: number
    private distanceToReward: number

    private steps: number
    private maxSteps: number

    constructor(private runtime: Runtime) {
        this.captureCollector = runtime.factoryContext.messageStore.collect("levelCaptured")
        this.deathCollector = runtime.factoryContext.messageStore.collect("rocketDeath")

        this.rocket = runtime.factoryContext.store.find("rocket", "rigidBody")[0]

        // next level is nearest level that is not captured
        this.nextLevel = nextFlag(runtime, this.rocket)

        this.previousDistanceToLevel = this.findDistanceToFlag(this.nextLevel)
        this.distanceToReward = 16 / this.previousDistanceToLevel

        this.steps = 0
        this.maxSteps = 10 * 20 * 4 // 20 seconds
    }

    next(steps: () => void): [number, boolean] {
        let reward = 0
        steps()
        ++this.steps

        if (this.steps >= this.maxSteps) {
            return [-80, true]
        }

        for (const message of this.deathCollector) {
            const velocity = this.rocket.components.rigidBody.linvel()
            const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)

            return [-32 - speed, true]
        }

        const distanceToFlag = this.findDistanceToFlag(this.nextLevel)

        if (distanceToFlag < this.previousDistanceToLevel) {
            reward += this.distanceToReward * (this.previousDistanceToLevel - distanceToFlag)
            this.previousDistanceToLevel = distanceToFlag
        }

        if (this.nextLevel.components.level.inCapture) {
            reward += 4
        }

        for (const message of this.captureCollector) {
            reward += 512
            this.nextLevel = nextFlag(this.runtime, this.rocket)
            this.previousDistanceToLevel = this.findDistanceToFlag(this.nextLevel)

            return [512, true]
        }

        return [reward, false]
    }

    findDistanceToFlag(flagEntity: EntityWith<RuntimeComponents, "level">) {
        const dx =
            this.rocket.components.rigidBody.translation().x - flagEntity.components.level.flag.x
        const dy =
            this.rocket.components.rigidBody.translation().y - flagEntity.components.level.flag.y
        return Math.sqrt(dx * dx + dy * dy)
    }
}

function nextFlag(runtime: Runtime, rocket: EntityWith<RuntimeComponents, "rocket" | "rigidBody">) {
    const distanceToFlag = (flagEntity: EntityWith<RuntimeComponents, "level">) => {
        const dx = rocket.components.rigidBody.translation().x - flagEntity.components.level.flag.x
        const dy = rocket.components.rigidBody.translation().y - flagEntity.components.level.flag.y
        return Math.sqrt(dx * dx + dy * dy)
    }

    const nextLevel = runtime.factoryContext.store
        .find("level")
        .filter(level => !level.components.level.captured)
        .map(level => [level, distanceToFlag(level)] as const)
        .reduce(([minLevel, minDistance], [level, distance]) =>
            distance < minDistance ? [level, distance] : [minLevel, minDistance],
        )[0]

    return nextLevel
}
