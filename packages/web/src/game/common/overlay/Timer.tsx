export {}
/*
import { useRef } from "react"
import { useGraphicUpdate } from "../../runtime-view/ViewUpdates"

import { useGameStore } from "../store/GameStore"

export function Timer() {
    const { store } = useGameStore(state => state.systemContext)

    const divRef = useRef<HTMLDivElement>(null!)

    useGraphicUpdate(ticked => {
        if (ticked === false) {
            return
        }

        if (store.world.has("world")) {
            divRef.current.innerText = store.world.components.world.ticks.toString()
        }
    })

    return (
        <>
            <div ref={divRef} />
        </>
    )
}
*/
