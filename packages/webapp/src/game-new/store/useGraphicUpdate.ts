import { useEffect, useRef } from "react"

import { useGameStore } from "./GameStore"

// ticked indicates whether the physics engine ticked since the last frame
export function useGraphicUpdate(listener: (ticked: boolean) => void) {
    const listenerRef = useRef(listener)
    const subscribe = useGameStore(store => store.subscribeGraphicUpdate)
    
    useEffect(() => void (listenerRef.current = listener), [listener])
    useEffect(() => subscribe(listenerRef), [subscribe])
}
