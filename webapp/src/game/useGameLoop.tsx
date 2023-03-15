import { useFrame } from "@react-three/fiber"

export const useGameLoop = (update: () => void, customTimePerFrame?: number) => {
    const timePerFrame = customTimePerFrame ?? 1000 / 60
    let lastTime = performance.now()

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
        }
    })

}
