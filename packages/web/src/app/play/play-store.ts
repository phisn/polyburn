import { ReplayModel } from "runtime/proto/replay"
import { WorldModel } from "runtime/proto/world"
import { Game } from "web-game/src/game/game"
import { GameLoop } from "web-game/src/game/game-loop"
import { GameHooks } from "web-game/src/game/game-settings"
import { createStore } from "zustand"
import { useAppStore } from "../../common/storage/app-store"

interface FinishedStatus {
    type: "finished"
    state: "uploading" | "uploaded" | "unauthenticated"

    model: ReplayModel
    time: number
    deaths: number
}

interface RunningStatus {
    type: "running"
}

type PlayStatus = FinishedStatus | RunningStatus

interface PlayProps {
    worldname: string
    gamemode: string
    model: WorldModel
}

interface PlayState extends PlayProps {
    status: PlayStatus

    game: Game
    gameLoop: GameLoop
}

export const createPlayStore = (props: PlayProps) => {
    const hooks: GameHooks = {
        onFinished: () => {},
        onUserJoined: () => {},
        onUserLeft: () => {},
        onConnected: () => {},
        onDisconnected: () => {},
    }

    const state = useAppStore.getState()
    let lobby

    if (state.jwt && state.user) {
        lobby = {
            host: new URL(import.meta.env.VITE_SERVER_URL).host,
            username: state.user.username,
            token: state.jwt,
        }
    }

    const game = new Game({
        instanceType: "play",

        worldname: props.worldname,
        world: props.model,
        gamemode: props.gamemode,

        hooks: hooks,
        lobby: lobby,

        canvas: canvasRef.current!,
    })

    const gameLoop = new GameLoop()

    return createStore<PlayState>()((set, get) => ({
        ...props,
        status: { type: "running" },
        game: null!,
        gameLoop: null!,
    }))
}
