import { useThree } from "@react-three/fiber"
import { useWorld } from "koota/react"
import { useMemo } from "react"
import { HandlerBackground } from "./handler-background"
import { HandlerObject } from "./handler-object"
import { HandlerShape } from "./handler-shape"
import { usePipelineEvent as useCanvasEvent } from "./use-canvas-event"
import { cursor } from "./util"

export function EventHandler() {
    const camera = useThree(x => x.camera)
    const world = useWorld()

    const handlerBackground = useMemo(() => new HandlerBackground(store, world), [store, world])
    const handlerObject = useMemo(() => new HandlerObject(store, world), [store, world])
    const handlerShape = useMemo(() => new HandlerShape(store, world), [store, world])

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
