import { RuntimeSystemStack } from "runtime/src/core/RuntimeSystemStack"

import { useGameStore } from "../store/GameStore"
import { useControls } from "./useControls"
import { useGameLoop } from "./useGameLoop"
import { useWebappUpdateDispatcher } from "./useWebappUpdateDispatcher"

const tickrate = 16.6667

export function useWebappRuntime(stack: RuntimeSystemStack) {
    const controls = useControls()

    const { store } = useGameStore(store => store.systemContext)
    const [started, start] = useGameStore(store => [store.started, store.start])

    const { updateInterpolation, updateGraphics } =
        useWebappUpdateDispatcher(store)

    useGameLoop(
        {
            update: updateSimulation,
            afterUpdate: updateInterpolation,
            afterFrame: updateGraphics,
        },
        tickrate,
    )

    function updateSimulation() {
        if (started === false) {
            if (controls.current.thrust) {
                start()
            } else {
                return
            }
        }

        if (controls.current.pause) {
            return
        }

        stack.step({
            thrust: controls.current.thrust,
            rotation: Math.fround(controls.current.rotation),
        })
    }

    return { controls }
}
