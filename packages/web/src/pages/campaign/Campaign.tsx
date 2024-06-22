import { useState } from "react"
import { WorldView } from "shared/src/views/world-view"
import { GamemodeModal } from "./GamemodeModal"
import { WorldSelection } from "./WorldSelection"

export function Campaign() {
    const [worldSelected, setWorldSelected] = useState<WorldView | undefined>()

    function onWorldSelected(world: WorldView) {
        setWorldSelected(world)
    }

    function onGamemodeUnselect() {
        setWorldSelected(undefined)
    }

    return (
        <>
            <GamemodeModal worldview={worldSelected} onUnselect={onGamemodeUnselect} />
            <WorldSelection onSelected={onWorldSelected} />
        </>
    )
}
