import { useFrame } from "@react-three/fiber"
import { createContext } from "react"

export interface GameLoopContext {
    subscribe: (callback: () => void) => () => void

    timePerFrame: number
    timeAtLastFrame: number
}

export const GameLoopContext = createContext<GameLoopContext>(null!)
export const GameLoopContextProvider = GameLoopContext.Provider

export const useGameLoop = (
    events: {
        update: () => void
        afterUpdate: () => void
        afterFrame: (frameProgress: number, time: number, ticked: boolean) => void
    },
    tickRate: number,
) => {
    let timer = performance.now()

    useFrame((_, delta) => {
        let now = performance.now()

        if (now - timer >= tickRate) {
            let frames = 0

            do {
                timer += tickRate
                events.update()
                events.afterUpdate()

                frames++

                now = performance.now()
            } while (now - timer >= tickRate)

            if (frames > 1) {
                console.log("skipped " + (frames - 1) + " frames")
            }

            events.afterFrame(getFrameProgress(), delta, true)
        } else {
            events.afterFrame(getFrameProgress(), delta, false)
        }

        function getFrameProgress() {
            let delta = (performance.now() - timer) / tickRate

            if (delta > 1) {
                delta = 1
            }

            return delta
        }
    })

    /*
        Graphics |   |   |   |   |   |   |     |     |     |     |     |     |
        Physics  |       |       |       |       |       |       |       |       |       |
                 1       2       3       4       5       6       7       8       9       0


        Graphics  |       |       |       |       |       |       |       |       |       |
        Physics  |   |   |   |   |   |   |     |     |     |     |     |     |
                 1     2     3     4     5     6     7     8     9     0     1     2     3
    */
}
