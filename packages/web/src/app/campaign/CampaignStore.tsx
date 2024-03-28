import { WorldView } from "shared/src/views/world-view"
import { create } from "zustand"

interface GameHandlerType {
    type: "game"
    gamemode: string
    userId?: string
}

interface ReplayHandlerType {
    type: "replay"
    gamemode: string
    userId: string
}

export type HandlerTypes = GameHandlerType | ReplayHandlerType

interface CampaignStore {
    worldSelected: WorldView | undefined
    handlerSelected: HandlerTypes | undefined

    cancelGamemodeSelection: () => void
    selectGameHandler: (gamemode: string, userId?: string) => void
    selectReplayHandler: (gamemode: string, userId: string) => void

    selectWorld: (world: WorldView | undefined) => void
    selectHandler: (handler: HandlerTypes | undefined) => void
}

export const useCampaignStore = create<CampaignStore>(set => ({
    worldSelected: undefined,
    handlerSelected: undefined,

    cancelGamemodeSelection: () => set({ worldSelected: undefined }),
    selectGameHandler: (gamemode, userId) =>
        set({ handlerSelected: { type: "game", gamemode, userId } }),
    selectReplayHandler: (gamemode, userId) =>
        set({ handlerSelected: { type: "replay", gamemode, userId } }),
    selectWorld: world => set({ worldSelected: world }),
    selectHandler: handler => set({ handlerSelected: handler }),
}))
