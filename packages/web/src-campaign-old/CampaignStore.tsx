import { GamemodeView } from "shared/src/views/gamemode-view"
import { WorldView } from "shared/src/views/world-view"
import { create } from "zustand"
import { GameHandlerProps } from "./player-handlers/GameHandler"
import { ReplayHandlerProps } from "./player-handlers/ReplayHandler"

type HandlerTypes = GameHandlerProps | ReplayHandlerProps

interface CampaignStore {
    worldSelected: WorldView | undefined
    handlerSelected: HandlerTypes | undefined

    cancelGamemodeSelection: () => void
    selectGameHandler: (gamemode: GamemodeView, userId?: string) => void
    selectReplayHandler: (gamemode: GamemodeView, userId: string) => void

    selectWorld: (world: WorldView | undefined) => void
    selectHandler: (handler: HandlerTypes | undefined) => void
}

export const useCampaignStore = create<CampaignStore>(set => ({
    worldSelected: undefined,
    handlerSelected: undefined,

    cancelGamemodeSelection: () => set({ worldSelected: undefined }),
    selectGameHandler: (gamemode, userId) =>
        set(state => ({
            handlerSelected: {
                type: "game",
                worldSelected: state.worldSelected!,
                gamemodeSelected: gamemode,
                username: userId,
            },
        })),
    selectReplayHandler: (gamemode, userId) =>
        set(state => ({
            handlerSelected: {
                type: "replay",
                worldSelected: state.worldSelected!,
                gamemodeSelected: gamemode,
                userId,
            },
        })),

    selectWorld: world => set({ worldSelected: world }),
    selectHandler: handler => set({ handlerSelected: handler }),
}))
