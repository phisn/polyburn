import { WebappSystemStack } from "../runtime-webapp/WebappSystemStack"
import { useGameStore } from "../store/GameStore"
import { useControls } from "./useControls"
import { useGameLoop } from "./useGameLoop"
import { useWebappUpdateDispatcher } from "./useWebappUpdateDispatcher"

const tickrate = 16.6667

export function useWebappRuntime(stack: WebappSystemStack) {
    const controls = useControls()

    const { store } = useGameStore(store => store.systemContext)
    const [started, start] = useGameStore(store => [store.started, store.start])

    const { updateInterpolation, updateGraphics } = useWebappUpdateDispatcher(store)

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

        const rotationAfterCapture = stack.factoryContext.replayCaptureService.captureFrame({
            thrust: controls.current.thrust,
            rotation: controls.current.rotation,
        })

        stack.step({
            thrust: controls.current.thrust,
            rotation: rotationAfterCapture,
        })
    }

    return { controls }
}
