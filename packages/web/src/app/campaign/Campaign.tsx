import { WorldView } from "shared/src/views/world-view"
import { useModalView } from "../../common/storage/use-modal-view"
import { useCampaignStore } from "./CampaignStore"
import { GamemodeModal } from "./GamemodeModal"
import { WorldSelection } from "./WorldSelection"

import { Transition } from "@headlessui/react"
import { CSSProperties, useEffect, useRef, useState } from "react"
import "./Campaign.tsx.css"
import LoadingIndicator from "./LoadingIndicator"

// TODO: implement loading screen later around game/players
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const rapier = import("@dimforge/rapier2d")

export function Campaign() {
    const worldSelected = useCampaignStore(state => state.worldSelected)
    const selectWorld = useCampaignStore(state => state.selectWorld)

    const handler = useCampaignStore(state => state.handlerSelected)
    const selectHandler = useCampaignStore(state => state.selectHandler)

    useModalView(worldSelected !== undefined && handler === undefined)

    function onWorldSelected(world: WorldView | undefined) {
        selectWorld(world)
        selectHandler(undefined)

        window.scrollTo(0, 0)
    }

    const [isStartLoading, setIsStartLoading] = useState(false)

    useEffect(() => {
        if (worldSelected && handler) {
            setTimeout(() => {
                setIsStartLoading(true)
            }, 200)

            /*
            setTimeout(() => {
                setIsStartLoading(false)
                selectHandler(undefined)
                selectWorld(undefined)
            }, 1000)
            */
        }
    }, [worldSelected, handler, selectHandler, selectWorld])

    if (isStartLoading) {
        return (
            <div className="absolute inset-0">
                <GameWindow />
            </div>
        )
    }

    return (
        <>
            {/* opacity from 0 to 100 */}
            <Transition
                show={worldSelected !== undefined && handler !== undefined}
                as="div"
                className={"absolute inset-0 z-50 bg-black"}
                enter="duration-200"
                enterFrom="opacity-0"
                enterTo="opacity-100"
            />

            <WorldSelection onSelected={world => onWorldSelected(world)} />
            <GamemodeModal />
        </>
    )
}

const canvasStyle: CSSProperties = {
    msTouchAction: "manipulation",
    touchAction: "none",
    userSelect: "none",

    // Prevent canvas selection on ios
    // https://github.com/playcanvas/editor/issues/160
    WebkitTouchCallout: "none",
    WebkitUserSelect: "none",
    WebkitTapHighlightColor: "rgba(255,255,255,0)",
}

let rustGame: any = null

function GameWindow() {
    const gameRef = useRef<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (rustGame === null) {
            console.log("loading rust game")
            import("rust-game").then(game => {
                gameRef.current = game
                rustGame = game

                setTimeout(() => {
                    setLoading(false)
                }, 100)
            })
        } else {
            console.log("rust game already loaded")
            gameRef.current = rustGame
            setLoading(false)
        }
    }, [])

    return (
        <>
            <canvas
                id="canvas"
                style={{
                    ...canvasStyle,
                    height: "100%",
                    width: "100%",
                    background: "#000000",
                }}
            />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <LoadingIndicator
                    loading={loading}
                    onAnimationEnd={() => {
                        gameRef.current.runGame()
                    }}
                />
            </div>
        </>
    )
}
