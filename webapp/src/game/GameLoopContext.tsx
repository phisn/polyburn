import { createContext } from "react"

export interface GameLoopContext {
    timePerFrame: number,
    timeAtLastFrame: number,
}

export const GameLoopContext = createContext<GameLoopContext>({
    timePerFrame: 0,
    timeAtLastFrame: 0,
})

export const GameLoopContextProvider = GameLoopContext.Provider
