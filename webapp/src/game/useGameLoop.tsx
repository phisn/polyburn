import { useFrame } from "@react-three/fiber"
import { createContext, useRef } from "react"

export interface GameLoopContext {
    subscribe: (callback: () => void) => () => void,
    
    timePerFrame: number,
    timeAtLastFrame: number,
}

export const GameLoopContext = createContext<GameLoopContext>(null!)
export const GameLoopContextProvider = GameLoopContext.Provider

export const useGameLoop = (update: () => void, customTimePerFrame?: number) => {
    const timePerFrame = customTimePerFrame ?? 1000 / 60
    let lastTime = performance.now()

    const subscribers = useRef<(() => void)[]>([])

    const gameLoopContextRef = useRef<GameLoopContext>({
        subscribe: (callback: () => void) => {
            console.log("Subscribed to game loop")
            subscribers.current.push(callback)

            return () => {
                subscribers.current = subscribers.current.filter(subscriber => subscriber !== callback)
            }
        },
        timePerFrame,
        timeAtLastFrame: lastTime,
    })

    useFrame(() => {
        const now = performance.now()
        
        if (now - lastTime >= timePerFrame) {
            let frames = 0

            do {
                lastTime += timePerFrame
                update()

                frames++
            } while (now - lastTime >= timePerFrame)

            if (frames > 1) {
                console.log("Skipped " + (frames - 1) + " frames")
            }

            gameLoopContextRef.current.timeAtLastFrame = lastTime

            subscribers.current.forEach(subscriber => subscriber())
        }
    })

    return gameLoopContextRef
}
