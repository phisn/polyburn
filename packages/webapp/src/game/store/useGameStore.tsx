import { createContext, useContext } from "react"
import { useStore } from "zustand"

import { Runtime } from "../runtime/Runtime"
import { createGameStore,GameStore } from "./GameStore"

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
): U => {
    const store = useContext(GameStoreContext)
    
    if (!store) {
        throw new Error("GameStoreContext not found")
    }
    
    return useStore(store, selector, equalityFn)
}
