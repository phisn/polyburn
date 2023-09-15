import { useState } from "react"
import { WorldView } from "shared/src/views/WorldView"
import { useAppStore } from "../../common/storage/AppStore"
import { useModalView } from "../../common/storage/useModalView"
import { GamemodeModal } from "./GamemodeModal"
import { WorldSelection } from "./WorldSelection"
import { GameHandlerProps } from "./player-handlers/GameHandler"
import { Player } from "./player-handlers/Player"
import { ReplayHandlerProps } from "./player-handlers/ReplayHandler"

// TODO: implement loading screen later around game/players
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const rapier = import("@dimforge/rapier2d")

export function Campaign() {
    const [worldSelected, setWorldSelected] = useState<WorldView | undefined>()
    const [handler, setHandler] = useState<GameHandlerProps | ReplayHandlerProps | undefined>()

    useModalView(worldSelected !== undefined && handler === undefined)

    const userName = useAppStore(state => state.userName())
    console.log(userName)

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
