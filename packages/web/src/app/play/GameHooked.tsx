import { useMemo, useState } from "react"
import { WorldModel } from "runtime/proto/world"
import { Runtime, newRuntime } from "runtime/src/runtime"
import { GameHooks } from "web-game/src/game/game-settings"
import { Finished } from "./Finished"
import { Game } from "./Game"

export function GameWithCanvasHooked(props: { model: WorldModel }) {
    const [finishedWith, setFinishedWith] = useState<Runtime | undefined>(undefined)

    const hooks = useMemo(
        () =>
            ({
                onFinished: runtime => {
                    setFinishedWith(runtime)
                },
            }) satisfies GameHooks,
        [],
    )

    if (finishedWith) {
        return <Finished runtime={newRuntime(model, "")} />
    }

    return <Game model={props.model} hooks={hooks} />
}
