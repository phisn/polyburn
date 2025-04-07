import { useThree } from "@react-three/fiber"
import { useWorld } from "koota/react"
import { DependencyList, useEffect, useMemo, useRef } from "react"
import { OrthographicCamera } from "three"
import { EventContext } from "./event"
import { HandlerBackground } from "./handler-background"
import { HandlerObject } from "./handler-object"
import { HandlerShape } from "./handler-shape"
import { usePipelineEvent as useCanvasEvent } from "./use-canvas-event"
import { cursor } from "./util"

export function EventHandler() {
    const camera = useThree(x => x.camera)
    const world = useWorld()

    const context: EventContext = useMemo(
        () => ({
            camera: camera as OrthographicCamera,
        }),
        [camera],
    )

    const handlerBackground = useRefDerived(
        () => new HandlerBackground(context, world),
        [context, world],
    )
    const handlerObject = useRefDerived(() => new HandlerObject(context, world), [context, world])
    const handlerShape = useRefDerived(() => new HandlerShape(context, world), [context, world])

    useCanvasEvent(event => {
        cursor.default()

        handlerBackground.handleMoving(event)
        handlerObject.handleMoving(event)
        handlerShape.handleMoving(event)
        handlerShape.handleVertex(event)

        handlerObject.handleDefault(event)
        handlerShape.handleDefault(event)

        handlerBackground.handleDefault(event)
    })

    return <></>
}

export function useRefDerived<T>(f: () => T, deps: DependencyList): T {
    const firstRenderRef = useRef(true)
    const ref = useRef<T>()

    if (ref.current === undefined) {
        ref.current = f()
    }

    useEffect(
        () => {
            if (firstRenderRef.current) {
                firstRenderRef.current = false
            } else {
                ref.current = f()
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        deps,
    )

    return ref.current
}
