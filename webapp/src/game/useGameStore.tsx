import { createContext, useContext } from "react"
import { useStore } from "zustand"

import { createGameStore, GameStore } from "./GameStore"

const GameStoreContext = createContext<ReturnType<typeof createGameStore>>(null!)

export const ProvideGameStore = ({ children }: { children: React.ReactNode }) => {
    const store = createGameStore()

    return (
        <GameStoreContext.Provider value={store}>
            {children}
        </GameStoreContext.Provider>
    )
}

export const useGameStore = <U,> (
    selector: (state: GameStore) => U, 
    equalityFn?: (a: U, b: U) => boolean
) => {
    const store = useContext(GameStoreContext)

    if (!store) {
        throw new Error("GameStoreContext not found")
    }

    return useStore(store, selector, equalityFn)
}
