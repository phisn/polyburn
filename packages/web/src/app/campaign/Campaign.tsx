import { useState } from "react"
import { WorldView } from "shared/src/views/WorldView"
import { useModalView } from "../../common/GlobalStore"
import { GamemodeModal } from "./GamemodeModal"
import { WorldSelection } from "./WorldSelection"
import { GameHandlerProps } from "./player-handlers/GameHandler"
import { Player } from "./player-handlers/Player"
import { ReplayHandlerProps } from "./player-handlers/ReplayHandler"

export function Campaign() {
    const [worldSelected, setWorldSelected] = useState<WorldView | undefined>()
    const [handler, setHandler] = useState<GameHandlerProps | ReplayHandlerProps | undefined>()

    useModalView(worldSelected !== undefined && handler === undefined)

    function onWorldSelected(name: WorldView | undefined) {
        setWorldSelected(name)
        setHandler(undefined)

        window.scrollTo(0, 0)
    }

    function onSelectHandler(handler: GameHandlerProps | ReplayHandlerProps) {
        setHandler(handler)

        /*
        const runner = async () => {
            if (!document.fullscreenElement && document.fullscreenEnabled) {
                await document.documentElement.requestFullscreen({
                    navigationUI: "hide",
                })
            }

            if ("orientation" in screen && "lock" in screen.orientation) {
                await screen.orientation.lock("landscape")
            }
        }

        runner().catch(e => {
            console.error(e)
        })
        */
    }

    if (worldSelected && handler) {
        return <Player handler={handler} onCancel={() => onWorldSelected(undefined)} />
    }

    return (
        <>
            <WorldSelection onSelected={world => onWorldSelected(world)} />

            <GamemodeModal
                openWithWorld={worldSelected}
                onSelected={handler => onSelectHandler(handler)}
                onCancel={() => onWorldSelected(undefined)}
            />
        </>
    )
}
