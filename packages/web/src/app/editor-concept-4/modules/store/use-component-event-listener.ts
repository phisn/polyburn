import { useEffect, useRef } from "react"
import { ComponentEvent } from "../../components/component-event"
import { useEditorStore } from "./EditorStoreProvider"

export function useComponentEventListener(listener: (event: ComponentEvent) => void) {
    const subscribe = useEditorStore(state => state.addListener)
    const listenerRef = useRef(listener)

    useEffect(() => {
        listenerRef.current = listener
    }, [listener])

    useEffect(() => subscribe(listenerRef), [subscribe, listenerRef])
}
