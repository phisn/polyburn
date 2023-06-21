import { useEffect, useRef } from "react"

import { useGameStore } from "./GameStore"

export function useGraphicUpdate(listener: () => void) {
    const listenerRef = useRef(listener)
    const subscribe = useGameStore(store => store.subscribeGraphicUpdate)
    
    useEffect(() => void (listenerRef.current = listener), [listener])
    useEffect(() => subscribe(listenerRef), [subscribe])
}
