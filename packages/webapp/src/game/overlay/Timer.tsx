import { useRef } from "react"

import { useGameStore } from "../store/GameStore"
import { useGraphicUpdate } from "../store/useGraphicUpdate"

export function Timer() {
    const store = useGameStore(state => state.entityStore)

    const divRef = useRef<HTMLDivElement>(null!)

    useGraphicUpdate(() => {
        if (store.world.has("world")) {
            divRef.current.innerText = store.world.components.world.ticks.toString()
        }
    })

    return (
        <>
            <div ref={divRef}/>
        </>
    )
}