import { EntityWith, MessageCollector } from "runtime-framework"
import { LevelCapturedMessage } from "runtime/src/core/level-capture/level-captured-message"
import { RocketDeathMessage } from "runtime/src/core/rocket/rocket-death-message"
import { RuntimeComponents } from "runtime/src/core/runtime-components"
import { Runtime } from "runtime/src/runtime"
import { ReplayFollowTracker } from "./replay-follow-tracker"

export interface Reward {
    next: (steps: () => void) => [number, boolean]
}

export type RewardFactory = (game: Runtime, replay: ReplayFollowTracker) => Reward

export class DefaultGameReward implements Reward {
    private captureCollector: MessageCollector<LevelCapturedMessage>
    private deathCollector: MessageCollector<RocketDeathMessage>

    private rocket: EntityWith<RuntimeComponents, "rocket" | "rigidBody">
    private nextLevel: EntityWith<RuntimeComponents, "level"> | undefined

    private steps: number
    private maxSteps: number

    private hasBeenInCapture: boolean
    private stepsSinceCapture: number

    constructor(
        private runtime: Runtime,
        private tracker: ReplayFollowTracker,
    ) {
        this.captureCollector = runtime.factoryContext.messageStore.collect("levelCaptured")
        this.deathCollector = runtime.factoryContext.messageStore.collect("rocketDeath")

        this.rocket = runtime.factoryContext.store.find("rocket", "rigidBody")[0]

        // next level is nearest level that is not captured
        this.nextLevel = nextFlag(runtime, this.rocket)

        this.steps = 0
        this.maxSteps = 10000 // ~~ 5 min
        this.hasBeenInCapture = false
        this.stepsSinceCapture = 0
    }

    next(steps: () => void): [number, boolean] {
        let reward = 0
        steps()
        ++this.steps
        ++this.stepsSinceCapture

        if (this.steps >= this.maxSteps) {
            return [-1, true]
        }

        reward += 16 * this.tracker.step()

        for (const message of this.deathCollector) {
            const velocity = this.rocket.components.rigidBody.linvel()
            const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)

            return [-1, true]
        }

        if (this.nextLevel === undefined) {
            return [(1 - this.steps / this.maxSteps) * 1024, true]
        }

        if (this.nextLevel.components.level.inCapture && this.hasBeenInCapture === false) {
            reward += 4
            this.hasBeenInCapture = true
        }

        for (const message of this.captureCollector) {
            reward +=
                Math.max(0, (1 - this.steps / this.maxSteps) * 500) +
                Math.max(0, (1 - this.stepsSinceCapture / (15 * 60)) * 500)

            this.nextLevel = nextFlag(this.runtime, this.rocket)
            this.hasBeenInCapture = false
            this.stepsSinceCapture = 0
        }

        return [reward, false]
    }

    findDistanceToLevel(flagEntity: EntityWith<RuntimeComponents, "level"> | undefined) {
        if (flagEntity === undefined) {
            return 0
        }

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

    const uncapturedLevels = runtime.factoryContext.store
        .find("level")
        .filter(level => !level.components.level.captured)

    if (uncapturedLevels.length === 0) {
        return undefined
    }

    const nextLevel = uncapturedLevels
        .map(level => [level, distanceToFlag(level)] as const)
        .reduce(([minLevel, minDistance], [level, distance]) =>
            distance < minDistance ? [level, distance] : [minLevel, minDistance],
        )[0]

    return nextLevel
}
