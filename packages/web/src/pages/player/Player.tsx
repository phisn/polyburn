import { useEffect } from "react"

import { ArrowClockwise } from "../../components/common/svg/ArrowClockwise"
import { FinishedPopup } from "./FinishedPopup"
import { PlayerStoreRunning, usePlayerStore } from "./PlayerStore"

export function Player() {
    const store = usePlayerStore()

    return (
        <>
            {<FinishedPopup store={store} />}
            {store.status === "running" && <GameCanvas store={store} />}
            {store.status === "running" && <RefreshButton store={store} />}
        </>
    )
}

function RefreshButton(props: { store: PlayerStoreRunning }) {
    return (
        <div
            onClick={() => props.store.gamePlayer.onReset()}
            className="btn btn-square btn-ghost absolute left-0 top-0 z-10 m-4"
        >
            <ArrowClockwise width="32" height="32" />
        </div>
    )
}

export function GameCanvas(props: { store: PlayerStoreRunning }) {
    const canvas = props.store.gamePlayer.store.resources.get("renderer").domElement

    useEffect(() => {
        console.log("Setting up new canvas")

        const root = document.getElementById("canvas-root")

        if (!root) {
            console.error("Canvas root not found")
            return
        }

        root.appendChild(canvas)

        canvas.style.height = "100%"
        canvas.style.width = "100%"
        canvas.style.overflow = "hidden"
        canvas.style.pointerEvents = "auto"
        canvas.style.touchAction = "none"
        canvas.style.userSelect = "none"

        canvas.className = "absolute inset-0 z-0 h-full w-full"

        return () => {
            root.removeChild(canvas)
        }
    }, [canvas])

    return <div id="canvas-root"></div>
}
