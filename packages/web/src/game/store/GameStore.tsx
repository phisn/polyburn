import { createContext, useContext } from "react"
import { createStore, useStore } from "zustand"

import { WebappFactoryContext } from "../runtime-view/webapp-runtime/WebappFactoryContext"
import { ZoomSteps } from "./ZoomSteps"

interface GameState {
    zoomIndex: number
}

export interface GameStore extends GameState {
    get systemContext(): WebappFactoryContext
    get graphicListeners(): React.MutableRefObject<(ticked: boolean, delta: number) => void>[]

    get performance(): number
    get started(): boolean

    start(): void

    setPerformance(performance: number): void

    // ticked indicates whether the physics engine ticked since the last frame
    subscribeGraphicUpdate(
        listener: React.MutableRefObject<(ticked: boolean, delta: number) => void>,
    ): () => void

    zoomIn(): void
    zoomOut(): void

    get zoom(): number
}

export const createGameStore = (systemContext: WebappFactoryContext) =>
    createStore<GameStore>((set, get) => ({
        systemContext,
        graphicListeners: [],

        performance: 0.5,
        started: false,

        start: () => {
            set({ started: true })
        },

        setPerformance: (performance: number) => {
            set({ performance })
        },

        zoomIndex: 0,

        subscribeGraphicUpdate: (listener: React.MutableRefObject<() => void>) => {
            set(state => ({
                graphicListeners: [...state.graphicListeners, listener],
            }))

            return () => {
                set(state => ({
                    graphicListeners: state.graphicListeners.filter(l => l !== listener),
                }))
            }
        },

        zoomIn: () => {
            const zoomIndex = get().zoomIndex
            if (zoomIndex < ZoomSteps.length - 1) {
                set({
                    zoomIndex: zoomIndex + 1,
                    zoom: ZoomSteps[zoomIndex + 1],
                })
            }
        },
        zoomOut: () => {
            const zoomIndex = get().zoomIndex
            if (ZoomSteps.length > 0) {
                set({
                    zoomIndex: zoomIndex - 1,
                    zoom: ZoomSteps[zoomIndex - 1],
                })
            }
        },

        get zoom() {
            return ZoomSteps[get().zoomIndex]
        },
    }))

const GameStoreContext = createContext<ReturnType<typeof createGameStore>>(null!)

export const ProvideGameStore = (props: {
    children: React.ReactNode
    systemContext: WebappFactoryContext
}) => {
    const store = createGameStore(props.systemContext)

    return <GameStoreContext.Provider value={store}>{props.children}</GameStoreContext.Provider>
}

export const useGameStore = <U,>(
    selector: (state: GameStore) => U,
    equalityFn?: (a: U, b: U) => boolean,
): U => {
    const store = useContext(GameStoreContext)

    if (!store) {
        throw new Error("GameStoreContext not found")
    }

    return useStore(store, selector, equalityFn)
}
