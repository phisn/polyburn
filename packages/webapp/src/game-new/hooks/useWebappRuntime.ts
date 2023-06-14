import { Gamemode } from "runtime/src/gamemode/Gamemode"

import { WorldModel } from "../../model/world/WorldModel"
import { useInterpolationUpdate } from "../runtime-view/webapp-runtime/interpolation/useInterpolationUpdate"
import { newWebappRuntime } from "../runtime-view/webapp-runtime/WebappRuntime"
import { useControls } from "./useControls"
import { useGameLoop } from "./useGameLoop"

export function useWebappRuntime(gamemode: Gamemode, world: WorldModel) {
    const fixed_world = JSON.parse(JSON.stringify(world)) // dirty hack to prototype for now. fix later
    const { store, stack } = newWebappRuntime(gamemode, fixed_world)

    const tickrate = 16.6667

    const { onPhysicsUpdate } = useInterpolationUpdate(store, tickrate)

    const controls = useControls()

    useGameLoop(
        {
            update: updateSimulation,
            afterUpdate: updateInterpolation,
            afterFrame: updateGraphics
        },
        tickrate
    )

    function updateSimulation() {
        if (controls.current.pause) {
            return
        }

        stack.step({
            thrust: controls.current.thrust,
            rotation: controls.current.rotation
        })
    }

    function updateInterpolation(time: number) {
        onPhysicsUpdate(time)
    }

    function updateGraphics() {
        void 0
    }

    return store
}
