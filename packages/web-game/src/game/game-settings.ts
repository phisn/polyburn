import { WorldModel } from "runtime/proto/world"
import { ReplayModel } from "../replay/replay-model"
import { ExtendedRuntime } from "./runtime-extension/new-extended-runtime"

export interface GameHooks {
    onFinished: undefined | ((runtime: ExtendedRuntime) => void)
}

export enum GameInstanceType {
    Play,
    Replay,
}

export interface GameSettings {
    instanceType: GameInstanceType
    canvas: HTMLCanvasElement

    worldname: string
    world: WorldModel
    gamemode: string

    hooks?: GameHooks
    replay?: ReplayModel
}
