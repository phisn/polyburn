import { WorldModel } from "runtime/proto/world"
import { Runtime } from "runtime/src/runtime"
import { ReplayModel } from "../replay/replay-model"

export interface GameHooks {
    onFinished: undefined | ((runtime: Runtime) => void)
}

export enum GameInstanceType {
    Play,
    Replay,
}

export interface GameSettings {
    instanceType: GameInstanceType
    canvas: HTMLCanvasElement

    world: WorldModel
    gamemode: string

    hooks?: GameHooks
    replay?: ReplayModel
}
