import { useMemo, useState } from "react"
import { WorldModel } from "runtime/proto/world"
import { GameHooks } from "web-game/src/game/game-settings"
import { ExtendedRuntime } from "web-game/src/game/runtime-extension/new-extended-runtime"
import { FinishedPopup } from "./FinishedPopup"
import { Game } from "./Game"

export function GameWithCanvasHooked(props: {
    worldname: string
    gamemode: string
    model: WorldModel
}) {
    const [finishedWith, setFinishedWith] = useState<ExtendedRuntime | undefined>(undefined)

    /*
    useEffect(() => {
        setFinishedWith(newRuntime(props.model, props.gamemode))
    }, [props.model, props.gamemode])
    */

    const hooks = useMemo(
        () =>
            ({
                onFinished: runtime => {
                    console.log("Game finished with", runtime)
                    setFinishedWith(runtime)
                },
            }) satisfies GameHooks,
        [],
    )

    return (
        <>
            {finishedWith && <FinishedPopup runtime={finishedWith} />}

            <Game
                worldname={props.worldname}
                gamemode={props.gamemode}
                model={props.model}
                hooks={hooks}
            />
        </>
    )
}
