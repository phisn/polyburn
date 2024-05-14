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

    private beenInCaptureFor: number

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
        this.beenInCaptureFor = 0
    }

    next(steps: () => void): [number, boolean] {
        let reward = -0.01
        steps()
        ++this.steps

        if (this.steps >= this.maxSteps) {
            return [-1, true]
        }

        // step will return acc reward of 1.0 for each level
        // we scale it down to 0.5 so that we on average need 50 frames to reach the next level
        reward += 0.5 * this.tracker.step()

        for (const _ of this.deathCollector) {
            return [-0.5, true]
        }

        if (this.nextLevel!.components.level.inCapture) {
            if (this.beenInCaptureFor < 4) {
                reward += 0.1
                this.beenInCaptureFor++
            } else {
                reward += 0.01
            }
        }

        for (const _ of this.captureCollector) {
            this.nextLevel = nextFlag(this.runtime, this.rocket)
            this.beenInCaptureFor = 0

            const noNextLevel = this.nextLevel === undefined

            return [1, noNextLevel]
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
