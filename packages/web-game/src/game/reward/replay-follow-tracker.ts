import { EntityWith, MessageCollector } from "runtime-framework"
import { ReplayModel } from "runtime/proto/replay"
import { LevelCapturedMessage } from "runtime/src/core/level-capture/level-captured-message"
import { RuntimeComponents } from "runtime/src/core/runtime-components"
import { RuntimeSystemContext } from "runtime/src/core/runtime-system-stack"
import { Point } from "runtime/src/model/point"
import { runtimeFromReplay } from "runtime/src/model/replay/runtime-from-replay"
import { Runtime } from "runtime/src/runtime"

export interface ReplayProcessed {
    positionsInLevels: Point[][]
    inputsInLevels: RuntimeSystemContext[][]
}

export function processReplayForAgent(replay: ReplayModel, runtime: Runtime): ReplayProcessed {
    const positionsInLevels: Point[][] = [[]]
    const inputsInLevels: RuntimeSystemContext[][] = [[]]

    const resultStack = runtimeFromReplay(
        runtime.factoryContext.rapier,
        replay,
        runtime.factoryContext.worldmodel,
        runtime.factoryContext.gamemode,
        stack => {
            return stack.factoryContext.messageStore.collect("levelCaptured")
        },
        (stack, input, context) => {
            for (const _ of context!) {
                positionsInLevels.push([])
                inputsInLevels.push([])
            }

            const vector = stack.factoryContext.store
                .find("rocket", "rigidBody")[0]
                .components.rigidBody.translation()

            positionsInLevels[positionsInLevels.length - 1].push({
                x: vector.x,
                y: vector.y,
            })

            inputsInLevels.at(-1)?.push(input)
        },
    )

    resultStack.factoryContext.physics.free()

    return {
        positionsInLevels,
        inputsInLevels,
    }
}

export class ReplayFollowTracker {
    private rocket: EntityWith<RuntimeComponents, "rigidBody">
    private i: number
    private level: number
    private captureCollector: MessageCollector<LevelCapturedMessage>

    private REPLAY_FOLLOW_UP_TO_D = 8.0

    constructor(
        runtime: Runtime,
        private replayProcessed: ReplayProcessed,
    ) {
        this.rocket = runtime.factoryContext.store.find("rocket", "rigidBody")[0]
        this.i = 0
        this.level = 0
        this.captureCollector = runtime.factoryContext.messageStore.collect("levelCaptured")

        this.step()
    }

    // returns progress
    step(): number {
        for (const _ of this.captureCollector) {
            this.level++
            this.i = 0
        }

        if (this.i >= this.replayProcessed.positionsInLevels[this.level].length) {
            return 0
        }

        const rocketPosition = this.rocket.components.rigidBody.translation()
        const previousI = this.i

        for (;;) {
            if (this.i + 1 >= this.replayProcessed.positionsInLevels[this.level].length) {
                break
            }

            const next = this.replayProcessed.positionsInLevels[this.level][this.i]
            const distance = Math.sqrt(
                (next.x - rocketPosition.x) ** 2 + (next.y - rocketPosition.y) ** 2,
            )

            if (distance > this.REPLAY_FOLLOW_UP_TO_D) {
                break
            }

            this.i++
        }

        return (this.i - previousI) / this.replayProcessed.positionsInLevels[this.level].length
    }

    next(): Point {
        if (this.i >= this.replayProcessed.positionsInLevels[this.level].length) {
            return this.replayProcessed.positionsInLevels[this.level][
                this.replayProcessed.positionsInLevels.length - 1
            ]
        }

        return this.replayProcessed.positionsInLevels[this.level][this.i]
    }
}
