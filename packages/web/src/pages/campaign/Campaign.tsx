import { useState } from "react"
import { WorldDTO } from "shared/src/server/world"
import { GamemodeModal } from "./GamemodeModal"
import { WorldSelection } from "./WorldSelection"

export function Campaign() {
    const [worldSelected, setWorldSelected] = useState<WorldDTO | undefined>()

    function onWorldSelected(world: WorldDTO) {
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
