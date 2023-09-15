import { createContext, MutableRefObject, useContext, useEffect, useRef } from "react"

export type GraphicListener = MutableRefObject<(ticked: boolean, delta: number) => void>
export type RuntimeListener = MutableRefObject<() => void>

export interface ViewUpdatesContext {
    subscribeGraphic: (listener: GraphicListener) => () => void
    subscribeRuntime: (listener: RuntimeListener) => () => void
}

const viewUpdatesContext = createContext<ViewUpdatesContext | undefined>(undefined)

export function ViewUpdatesProvider(props: {
    children: React.ReactNode
    context: ViewUpdatesContext
}) {
    return (
        <viewUpdatesContext.Provider value={props.context}>
            {props.children}
        </viewUpdatesContext.Provider>
    )
}

export function useGraphicUpdate(listener: (ticked: boolean, delta: number) => void) {
    const listenerRef = useRef(listener)
    const subscribe = useContext(viewUpdatesContext)?.subscribeGraphic

    if (!subscribe) {
        throw new Error("No graphics update context provided")
    }

    useEffect(() => void (listenerRef.current = listener), [listener])
    useEffect(() => subscribe(listenerRef), [subscribe])
}

export function useRuntimeUpdate(listener: () => void) {
    const listenerRef = useRef(listener)
    const subscribe = useContext(viewUpdatesContext)?.subscribeRuntime

    if (!subscribe) {
        throw new Error("No runtime update context provided")
    }

    useEffect(() => void (listenerRef.current = listener), [listener])
    useEffect(() => subscribe(listenerRef), [subscribe])
}
