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
    update: () => void, 
    afterUpdate: (time: number) => void, 
    tickRate: number, 
    tickRateLag: number) => {
    let lastTime = performance.now()

    useFrame(() => {
        const now = performance.now()
        
        if (now - lastTime >= tickRate * tickRateLag) {
            // console.log(`data(now${now}, lastTime${lastTime}, tickRate${tickRate}, tickRateLag${tickRateLag}, now - lastTime${now - lastTime})`)

            let frames = 0

            do {
                lastTime += tickRate
                update()

                frames++
            } while (now - lastTime >= tickRate)

            if (frames > 1) {
                console.log("Skipped " + (frames - 1) + " frames")
            }

            // console.log("afterUpdate")
            afterUpdate?.(lastTime)
        }
    })
}
