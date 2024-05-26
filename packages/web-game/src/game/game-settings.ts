import { WorldModel } from "runtime/proto/world"
import { OtherUser } from "shared/src/websocket-api/lobby-api"
import { ExtendedRuntime } from "./runtime-extension/new-extended-runtime"

export interface ReplayModel {}

export interface GameHooks {
    onFinished: undefined | ((runtime: ExtendedRuntime) => void)

    onUserJoined: undefined | ((username: OtherUser) => void)
    onUserLeft: undefined | ((username: OtherUser) => void)

    onConnected: undefined | ((userCount: number) => void)
    onDisconnected: undefined | (() => void)
}

export interface LobbySettings {
    host: string
    username: string
    token: string
}

export interface PlayGameSettings {
    instanceType: "play"

    worldname: string
    world: WorldModel
    gamemode: string

    // if user is provided the game will connect to the lobby
    lobby?: LobbySettings
}

export interface ReplayGameSettings {
    instanceType: "replay"

    worldname: string
    world: WorldModel
    gamemode: string

    replay: ReplayModel
}

export type GameSettings = (PlayGameSettings | ReplayGameSettings) & {
    hooks?: GameHooks
}
