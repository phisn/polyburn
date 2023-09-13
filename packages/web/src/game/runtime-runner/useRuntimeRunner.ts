import { EntityStore } from "runtime-framework"
import { WebappComponents } from "../runtime-webapp/WebappComponents"
import { useEntitySet } from "../runtime-webapp/common/useEntitySet"
import {
    interpolateEntity,
    updateInterpolatedEntity,
} from "../runtime-webapp/interpolation/InterpolatedEntity"
import { useGameLoop } from "./useGameLoop"

const tickrate = 16.6667

export function useRuntimeRunner(store: EntityStore<WebappComponents>, step: () => void) {
    const interpolationEntities = useEntitySet(store, "interpolation", "rigidBody")
    const listeners: any[] = [] // useGameStore(store => store.graphicListeners)

    function updateInterpolation() {
        for (const entity of interpolationEntities) {
            updateInterpolatedEntity(entity)
        }
    }

    function updateGraphics(frameProgress: number, delta: number, ticked: boolean) {
        for (const entity of interpolationEntities) {
            interpolateEntity(entity, frameProgress)
        }

        for (const listener of listeners) {
            listener.current(ticked, delta)
        }
    }

    useGameLoop(
        {
            update: step,
            afterUpdate: updateInterpolation,
            afterFrame: updateGraphics,
        },
        tickrate,
    )
}
