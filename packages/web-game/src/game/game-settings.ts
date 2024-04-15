import { WorldModel } from "runtime/proto/world"
import { ReplayModel } from "../replay/replay-model"

export interface GameHooks {
    onFinish(): void
}

export enum GameInstanceType {
    Play,
    Replay,
}

export interface GameSettings {
    instanceType: GameInstanceType

    world: WorldModel
    gamemode: string

    hooks?: GameHooks
    replay?: ReplayModel
}
