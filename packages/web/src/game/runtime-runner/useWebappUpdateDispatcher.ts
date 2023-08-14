import { useMemo } from "react"
import { EntityStore } from "runtime-framework"

import {
    interpolateEntity,
    updateInterpolatedEntity,
} from "../runtime-view/webapp-runtime/interpolation/InterpolatedEntity"
import { WebappComponents } from "../runtime-view/webapp-runtime/WebappComponents"
import { useGameStore } from "../store/GameStore"

export function useWebappUpdateDispatcher(store: EntityStore<WebappComponents>) {
    const entities = useMemo(() => store.newSet("interpolation", "rigidBody"), [store])
    const listeners = useGameStore(store => store.graphicListeners)

    function updateInterpolation() {
        for (const entity of entities) {
            updateInterpolatedEntity(entity)
        }
    }

    function updateGraphics(time: number, ticked: boolean) {
        for (const entity of entities) {
            interpolateEntity(entity, time)
        }

        for (const listener of listeners) {
            listener.current(ticked)
        }
    }

    return {
        updateInterpolation,
        updateGraphics,
    }
}
