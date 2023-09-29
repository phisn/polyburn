import { useMemo, useRef } from "react"
import { EntityStore } from "runtime-framework"
import { useEntitySet } from "../../common/hooks/use-entity-set"
import {
    interpolateEntity,
    updateInterpolatedEntity,
} from "../runtime-extension/interpolation/interpolated-entity"
import { WebappComponents } from "../runtime-extension/webapp-components"
import { GraphicListener, RuntimeListener, ViewUpdatesContext } from "../runtime-view/ViewUpdates"
import { useGameLoop } from "./use-game-loop"

const tickrate = 16.6667

export function useRuntimeRunner(
    store: EntityStore<WebappComponents>,
    step: () => void,
): ViewUpdatesContext {
    const interpolationEntities = useEntitySet(store, "interpolation")

    const graphicListenersRef = useRef<GraphicListener[]>([])
    const runtimeListenersRef = useRef<RuntimeListener[]>([])

    const subscribeGraphic = useMemo(
        () => (listener: GraphicListener) => {
            graphicListenersRef.current.push(listener)

            return () => {
                const index = graphicListenersRef.current.indexOf(listener)
                if (index !== -1) {
                    graphicListenersRef.current.splice(index, 1)
                }
            }
        },
        [],
    )

    const subscribeRuntime = useMemo(
        () => (listener: RuntimeListener) => {
            runtimeListenersRef.current.push(listener)

            return () => {
                const index = runtimeListenersRef.current.indexOf(listener)
                if (index !== -1) {
                    runtimeListenersRef.current.splice(index, 1)
                }
            }
        },
        [],
    )

    function update() {
        for (const entity of interpolationEntities) {
            updateInterpolatedEntity(entity)
        }

        step()

        for (const listener of runtimeListenersRef.current) {
            listener.current()
        }
    }

    function afterFrame(frameProgress: number, delta: number, ticked: boolean) {
        for (const entity of interpolationEntities) {
            interpolateEntity(entity, frameProgress)
        }

        for (const listener of graphicListenersRef.current) {
            listener.current(ticked, delta)
        }
    }

    useGameLoop(
        {
            update,
            afterFrame,
        },
        tickrate,
    )

    return {
        subscribeGraphic,
        subscribeRuntime,
    }
}
