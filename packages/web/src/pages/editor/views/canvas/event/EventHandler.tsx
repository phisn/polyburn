import { useThree } from "@react-three/fiber"
import { DependencyList, useMemo, useRef } from "react"
import { OrthographicCamera } from "three"
import { useEditorStore } from "../../../store/store"
import { EventContext } from "./event"
import { HandlerBackground } from "./handler-background"
import { HandlerObject } from "./handler-object"
import { HandlerShape } from "./handler-shape"
import { usePipelineEvent as useCanvasEvent } from "./use-canvas-event"
import { cursor } from "./util"

export function EventHandler() {
    const camera = useThree(x => x.camera)
    const world = useEditorStore(x => x.world)

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

        if (event.consumed) {
            useEditorStore.getState().highlight()
        }

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
    const ref = useRef<T>()

    const fRef = useRef(f)
    fRef.current = f

    const depsRef = useRef(deps)
    let differentDeps = false

    for (let i = 0; i < deps.length; ++i) {
        if (deps[i] !== depsRef.current) {
            differentDeps = true
            break
        }
    }

    if (differentDeps) {
        ref.current = f()
        depsRef.current = deps
    }

    if (ref.current === undefined) {
        ref.current = f()
    }

    return ref.current
}
