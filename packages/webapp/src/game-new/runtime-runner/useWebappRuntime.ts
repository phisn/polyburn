import { Gamemode } from "runtime/src/gamemode/Gamemode"

import { WorldModel } from "../../model/world/WorldModel"
import { useUpdateInterpolation } from "../runtime-view/webapp-runtime/interpolation/useUpdateInterpolation"
import { newWebappRuntime } from "../runtime-view/webapp-runtime/WebappRuntime"
import { useControls } from "./useControls"
import { useGameLoop } from "./useGameLoop"

const tickrate = 16.6667

export function useWebappRuntime(gamemode: Gamemode, world: WorldModel) {
    const fixed_world = JSON.parse(JSON.stringify(world)) // dirty hack to prototype for now. fix later

    const { store, stack } = newWebappRuntime(gamemode, fixed_world)
    const { onPhysicsUpdate } = useUpdateInterpolation(store, tickrate)
    const controls = useControls()

    useGameLoop(
        {
            update: updateSimulation,
            afterUpdate: updateInterpolation,
            afterFrame: updateGraphics
        },
        tickrate)

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

    function updateGraphics(time: number) {
        void 0
    }

    return store
}
