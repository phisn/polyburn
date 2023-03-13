import { DependencyList, useEffect } from "react"

export const useGameLoop = (update: () => void, updateGraphics: () => void, deps: DependencyList = [], customTimePerFrame?: number) => useEffect(() => {
    const timePerFrame = customTimePerFrame ?? 1000 / 60

    let lastTime = performance.now()
    let running = true

    const gameLoop = () => {
        if (!running) {
            return
        }

        const now = performance.now()
        
        if (now - lastTime >= timePerFrame) {
            do {  
                lastTime += timePerFrame
                update()
            } while (now - lastTime >= timePerFrame)
            
            updateGraphics()
        }

        requestAnimationFrame(gameLoop)
    }

    requestAnimationFrame(gameLoop)

    return () => {
        running = false
    }

}, [ update, ...deps ])
