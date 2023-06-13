
import { createContext, useContext } from "react"
import { EntityStore } from "runtime-framework"
import { createStore, useStore } from "zustand"

import { WebappComponents } from "../runtime-view/webapp-runtime/WebappComponents"
import { ZoomSteps } from "./ZoomSteps"

interface GameState {
    zoomIndex: number
}

export interface GameStore extends GameState {
    get entityStore(): EntityStore<WebappComponents>

    zoomIn(): void
    zoomOut(): void

    get zoom(): number
}

export const createGameStore = (entityStore: EntityStore<WebappComponents>) => 
    createStore<GameStore>((set, get) => ({
        entityStore,

        zoomIndex: 0,

        zoomIn: () => {
            const zoomIndex = get().zoomIndex
            if (zoomIndex < ZoomSteps.length - 1) {
                set({
                    zoomIndex: zoomIndex + 1,
                    zoom: ZoomSteps[zoomIndex + 1]
                })
            }
        },
        zoomOut: () => {
            const zoomIndex = get().zoomIndex
            if (ZoomSteps.length > 0) {
                set({
                    zoomIndex: zoomIndex - 1,
                    zoom: ZoomSteps[zoomIndex - 1]
                })
            }
        },

        get zoom() {
            return ZoomSteps[get().zoomIndex]
        }
    }))

const GameStoreContext = createContext<ReturnType<typeof createGameStore>>(null!)

export const ProvideGameStore = (props: { children: React.ReactNode, entityStore: EntityStore<WebappComponents> }) => {
    const store = createGameStore(props.entityStore)
        
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
