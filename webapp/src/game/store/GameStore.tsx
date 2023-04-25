
import { createStore } from "zustand"

import { Point } from "../../model/world/Point"
import { Runtime } from "../runtime/Runtime"
import { canZoomIn, canZoomOut } from "./Zoom"

export interface InterpolateUpdate {
    rocketPosition: Point
    rocketRotation: number
}

interface GameState {
    interpolateSubscribers: ((update: InterpolateUpdate) => void)[]

    zoomIndex: number
}

export interface GameStore extends GameState {
    get runtime(): Runtime

    zoomIn(): void
    zoomOut(): void

    interpolateSubscribe(callback: (update: InterpolateUpdate) => void): () => void
}

export const createGameStore = (runtime: Runtime) => 
    createStore<GameStore>((set, get) => ({
        runtime,

        interpolateSubscribers: [],
        zoomIndex: 1,

        zoomIn: () => {
            const zoomIndex = get().zoomIndex
            if (canZoomIn(zoomIndex)) {
                set({
                    zoomIndex: zoomIndex + 1
                })
            }
        },
        zoomOut: () => {
            const zoomIndex = get().zoomIndex
            if (canZoomOut(zoomIndex)) {
                set({
                    zoomIndex: zoomIndex - 1
                })
            }
        },

        interpolateSubscribe: (callback) => {
            const subscribers = get().interpolateSubscribers

            subscribers.push(callback)

            return () => {
                const index = subscribers.indexOf(callback)

                if (index > -1) {
                    subscribers.splice(index, 1)
                }
            }
        }
    }))
