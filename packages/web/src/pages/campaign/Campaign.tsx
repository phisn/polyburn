import { useState } from "react"
import { GamemodeModal } from "./GamemodeModal"
import { WorldSelection } from "./WorldSelection"

export function Campaign() {
    const [worldSelected, setWorldSelected] = useState<WorldInfoUnlocked | undefined>()

    function onWorldSelected(world: WorldInfoUnlocked) {
        setWorldSelected(world)
    }

    function onGamemodeUnselect() {
        setWorldSelected(undefined)
    }

    return (
        <>
            <GamemodeModal world={worldSelected} onUnselect={onGamemodeUnselect} />
            <WorldSelection onSelected={onWorldSelected} />
        </>
    )
}
