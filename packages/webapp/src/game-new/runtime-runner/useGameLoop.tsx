import { useFrame } from "@react-three/fiber"
import { createContext } from "react"

export interface GameLoopContext {
    subscribe: (callback: () => void) => () => void,

    timePerFrame: number,
    timeAtLastFrame: number,
}

export const GameLoopContext = createContext<GameLoopContext>(null!)
export const GameLoopContextProvider = GameLoopContext.Provider

export const useGameLoop = (
    events: {
        update: () => void
        afterUpdate: (time: number) => void
        afterFrame: (time: number) => void
    },
    tickRate: number) => {
        
    let lastTime = performance.now()

    useFrame(() => {
        const now = performance.now()
        
        if (now - lastTime >= tickRate) {
            let frames = 0

            do {
                lastTime += tickRate
                events.update()

                frames++
            } while (now - lastTime >= tickRate)

            if (frames > 1) {
                console.log("Skipped " + (frames - 1) + " frames")
            }

            events.afterUpdate(lastTime)
        }

        events.afterFrame(lastTime)
    })
}
