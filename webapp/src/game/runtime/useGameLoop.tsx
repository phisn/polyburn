import { DependencyList, useEffect } from "react"

export const useGameLoop = (update: () => void, deps: DependencyList = [], customTimePerFrame?: number) => useEffect(() => {
    const timePerFrame = customTimePerFrame ?? 1000 / 60

    let lastTime = performance.now()
    let running = true

    const gameLoop = () => {
        if (!running) {
            return
        }

        const now = performance.now()
        
        while (now - lastTime >= timePerFrame) {
            lastTime += timePerFrame
            update()
        }

        requestAnimationFrame(gameLoop)
    }

    requestAnimationFrame(gameLoop)

    return () => {
        running = false
    }

}, [ update, ...deps ])
