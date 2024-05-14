import { WorldModel } from "runtime/proto/world"
import { ExtendedRuntime } from "./runtime-extension/new-extended-runtime"

export interface ReplayModel {}

export interface GameHooks {
    onFinished: undefined | ((runtime: ExtendedRuntime) => void)
}

export interface PlayGameSettings {
    instanceType: "play"

    worldname: string
    world: WorldModel
    gamemode: string

    // if userToken is provided the game will connect to the lobby
    userToken?: string
}

export interface ReplayGameSettings {
    instanceType: "replay"

    worldname: string
    world: WorldModel
    gamemode: string

    replay: ReplayModel
}

export type GameSettings = (PlayGameSettings | ReplayGameSettings) & {
    canvas: HTMLCanvasElement
    hooks?: GameHooks
}
