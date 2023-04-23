import { createContext, useContext } from "react"
import { useStore } from "zustand"

import { createGameStore, GameStore } from "./GameStore"
import { Runtime } from "./runtime/Runtime"

const GameStoreContext = createContext<ReturnType<typeof createGameStore>>(null!)

export const ProvideGameStore = (props: { children: React.ReactNode, runtime: Runtime }) => {
    const store = createGameStore(props.runtime)

    return (
        <GameStoreContext.Provider value={store}>
            {props.children}
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
