import { createContext, useContext } from "react"
import { ReplayModel } from "runtime/proto/replay"

// used to interact with game. game in itself has no side effects except settings. side effects
// like replay uploading after finish need to provided
export interface GameHook {
    finished?: (replay: ReplayModel) => void
}

const gameHookContext = createContext<GameHook | undefined>(undefined)

export function useGameHook() {
    return useContext(gameHookContext)
}

export function ProvideGameHook(props: { children: React.ReactNode; value: GameHook }) {
    return <gameHookContext.Provider value={props.value}>{props.children}</gameHookContext.Provider>
}
