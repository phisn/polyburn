import { useState } from "react"
import { WorldInfo } from "../../../../shared/src/worker-api/world-info"
import { GamemodeModal } from "./GamemodeModal"
import { WorldSelection } from "./WorldSelection"

export function Campaign() {
    const [worldSelected, setWorldSelected] = useState<WorldInfo | undefined>()

    function onWorldSelected(world: WorldInfo) {
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
