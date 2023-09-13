import { createContext, MutableRefObject, useContext, useEffect, useRef } from "react"

type Listener = (ticked: boolean, delta: number) => void

const graphicsUpdateContext = createContext<(listener: MutableRefObject<Listener>) => () => void>(
    () => () => {
        throw new Error("No graphics update context provided")
    },
)

export function GraphicsUpdateProvider(props: { children: React.ReactNode; subscribe: Listener }) {}

export function useGraphicUpdate(listener: Listener) {
    const listenerRef = useRef(listener)
    const subscribe = useContext(graphicsUpdateContext)

    useEffect(() => void (listenerRef.current = listener), [listener])
    useEffect(() => subscribe(listenerRef), [subscribe])
}
