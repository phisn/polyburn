import { useEffect, useRef } from "react"
import { BehaviorEvent } from "../../components/behavior-event"
import { useEditorStore } from "./EditorStoreProvider"

export function useComponentEventListener(listener: (event: BehaviorEvent) => void) {
    const subscribe = useEditorStore(state => state.addListener)
    const listenerRef = useRef(listener)

    useEffect(() => {
        listenerRef.current = listener
    }, [listener])

    useEffect(() => subscribe(listenerRef), [subscribe, listenerRef])
}
