"use client"

import { useRouter } from "next/navigation"
import { importWorld } from "runtime/src/model/world/WorldModel"
import Navbar from "../../../../common/components/Navbar"
import { StopSvg } from "../../../../common/inline-svg/Stop"
import Game from "../../../../game/Game"

export function PlayInClient(props: { map: string; gamemode: string }) {
    const world = importWorld(props.map)
    const router = useRouter()

    return (
        <body>
            <Game world={world} />
            <div
                className="absolute left-0 top-0 p-4"
                style={{
                    touchAction: "none",
                    userSelect: "none",

                    // Prevent canvas selection on ios
                    // https://github.com/playcanvas/editor/issues/160
                    WebkitTouchCallout: "none",
                    WebkitUserSelect: "none",
                    WebkitTapHighlightColor: "rgba(255,255,255,0)",
                }}
            >
                <Navbar>
                    <button
                        className="btn btn-square btn-ghost"
                        onClick={() => router.back()}
                    >
                        <StopSvg width="16" height="16" />
                    </button>
                </Navbar>
            </div>
        </body>
    )
}
