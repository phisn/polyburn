import RAPIER from "@dimforge/rapier2d"
import { ReplayModel } from "../../../proto/replay"
import { WorldConfig } from "../../../proto/world"
import { Game, GameInput } from "../../game"
import { GameStore } from "../store"
import { replayFramesFromBytes } from "./replay"

export function runtimeFromReplay<T>(
    rapier: typeof RAPIER,
    replay: ReplayModel,
    world: WorldConfig,
    gamemode: string,
    initializer?: (store: GameStore) => T,
    handler?: (input: GameInput, store: GameStore, context?: T) => void,
) {
    const replayFrames = replayFramesFromBytes(replay.frames)
    const game = new Game(
        {
            gamemode,
            world,
        },
        {
            rapier,
        },
    )

    let accumulator = 0

    const context = initializer?.(game.store)

    for (const frame of replayFrames) {
        accumulator += frame.diff

        const input = {
            rotation: accumulator,
            thrust: frame.thrust,
        }

        game.onUpdate(input)
        handler?.(input, game.store, context)
    }

    return game.store
}
