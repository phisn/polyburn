import { useEffect } from "react"

import { useGameStore } from "./GameStore"

export function useGraphicUpdate(listener: () => void) {
    const subscribe = useGameStore(store => store.subscribeGraphicUpdate)
    useEffect(() => subscribe(listener), [])
}
