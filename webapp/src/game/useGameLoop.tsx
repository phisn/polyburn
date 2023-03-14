import { useFrame } from "@react-three/fiber"

export const useGameLoop = (update: () => void, customTimePerFrame?: number) => {
    const timePerFrame = customTimePerFrame ?? 1000 / 144
    let lastTime = performance.now()

    useFrame(() => {
        const now = performance.now()
        
        if (now - lastTime >= timePerFrame) {
            do {  
                lastTime += timePerFrame
                update()
            } while (now - lastTime >= timePerFrame)
        }
    })

}
