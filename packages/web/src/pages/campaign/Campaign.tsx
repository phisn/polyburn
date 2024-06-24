import { useState } from "react"
import { WorldInfoUnlocked } from "../../../../shared/src/worker-api/world-info"
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
