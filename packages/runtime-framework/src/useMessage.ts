import { useEffect, useRef } from "react"

import { MessageStore } from "./MessageStore"

export function useMessage<Components extends object, Messages extends object, T extends keyof Messages>(
    store: MessageStore<Components, Messages>,
    message: T,
    listener: (message: Messages[T]) => void) {
    
    const listenerRef = useRef(listener)
    
    useEffect(() => void (listenerRef.current = listener), [listener])
    useEffect(() => store.listenTo(message, listenerRef.current), [store, message])
}
