import { useMemo, useState } from "react"
import { WorldModel } from "runtime/proto/world"
import { GameHooks } from "web-game/src/game/game-settings"
import { ExtendedRuntime } from "web-game/src/game/runtime-extension/new-extended-runtime"
import { useAppStore } from "../../common/storage/app-store"
import { FinishedPopup } from "./FinishedPopup"
import { Game } from "./Game"

export function GameWithCanvasHooked(props: {
    worldname: string
    gamemode: string
    model: WorldModel
}) {
    const [finishedWith, setFinishedWith] = useState<ExtendedRuntime | undefined>(undefined)

    const hooks = useMemo(
        () =>
            ({
                onFinished: runtime => {
                    console.log("Game finished with", runtime)
                    setFinishedWith(runtime)
                },
                onUserJoined: user => {
                    if (user.username === useAppStore.getState().user?.username) {
                        return
                    }

                    useAppStore.getState().newAlert({
                        type: "info",
                        message: `${user.username} joined the game`,
                    })
                },
                onUserLeft: user => {
                    if (user.username === useAppStore.getState().user?.username) {
                        return
                    }

                    useAppStore.getState().newAlert({
                        type: "info",
                        message: `${user.username} left the game`,
                    })
                },
                onConnected: userCount => {
                    useAppStore.getState().newAlert({
                        type: "info",
                        message: `Connected to game with ${userCount - 1} other player${userCount === 2 ? "" : "s"}`,
                    })
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
