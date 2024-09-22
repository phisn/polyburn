import { WorldConfig } from "game/proto/world"
import { UserOther } from "../../../../shared/src/lobby-api/user-other"

export interface ReplayModel {}

export interface GameHooks {
    onFinished?: () => void

    onUserJoined?: (username: UserOther) => void
    onUserLeft?: (username: UserOther) => void

    onConnected?: (userCount: number) => void
    onDisconnected?: () => void
}

export interface LobbySettings {
    host: string
    username: string
    token: string
}

export interface PlayGameSettings {
    instanceType: "play"

    worldname: string
    world: WorldConfig
    gamemode: string

    // if user is provided the game will connect to the lobby
    lobby?: LobbySettings
}

export interface ReplayGameSettings {
    instanceType: "replay"

    worldname: string
    world: WorldConfig
    gamemode: string

    replay: ReplayModel
}

export type GameSettings = (PlayGameSettings | ReplayGameSettings) & {
    hooks?: GameHooks
}
