
import { createContext, useContext } from "react"
import { createStore, useStore } from "zustand"

import { Runtime } from "../runtime/Runtime"
import { RuntimeInterpolated } from "./RuntimeInterpolated"
import { Zoom } from "./Zoom"

interface GameState {
    interpolated: RuntimeInterpolated
    zoom: Zoom
} 

export interface GameStore extends GameState {
    get runtime(): Runtime

    zoomIn(): void
    zoomOut(): void


}

export const createGameStore = (runtime: Runtime) => 
    createStore<GameStore>((set, get) => ({
        runtime,

        zoom: 1,
        zoomIndex: 1,

        zoomIn: () => {
            const zoomIndex = get().zoomIndex

            if (canZoomIn(zoomIndex)) {
                set({
                    zoom: ZoomsIndexed[zoomIndex + 1],
                    zoomIndex: zoomIndex + 1
                })
            }
        },
        zoomOut: () => {
            const nextZoomIndex = get().zoomIndex

            if (canZoomOut(nextZoomIndex)) {
                set({
                    zoom: ZoomsIndexed[nextZoomIndex - 1],
                    zoomIndex: nextZoomIndex - 1
                })
            }
        },
    }))

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
