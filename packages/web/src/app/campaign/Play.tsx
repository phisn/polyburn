import { useMemo } from "react"
import { ReplayModel } from "runtime/proto/replay"
import { WorldModel } from "runtime/proto/world"
import { base64ToBytes } from "runtime/src/model/base64ToBytes"
import { GamemodeView } from "shared/src/views/GamemodeView"
import { WorldView } from "shared/src/views/WorldView"
import { Navbar } from "../../common/components/Navbar"
import { StopSvg } from "../../common/components/inline-svg/Stop"
import { trpc } from "../../common/trpc/trpc"
import Game from "../../game/Game"
import { bytesToBase64 } from "../editor/models/exportModel"

export function Play(props: {
    worldSelected: WorldView
    gamemodeSelected: GamemodeView
    onCancel: () => void
}) {
    const worldModel = WorldModel.decode(base64ToBytes(props.worldSelected.model))

    const [replay] = trpc.replay.get.useSuspenseQuery({
        world: props.worldSelected.id.name,
        gamemode: props.gamemodeSelected.name,
    })

    const validateReplay = trpc.validateReplay.useMutation()

    const replayModel = useMemo(
        () => (replay && ReplayModel.decode(base64ToBytes(replay.model))) || undefined,
        [replay],
    )

    return (
        <div className="absolute inset-0">
            <Game
                runtimeProps={{
                    world: worldModel,
                    name: props.worldSelected.id.name,
                    gamemode: props.gamemodeSelected.name,

                    replay: replayModel,

                    hook: {
                        finished: replay => {
                            validateReplay.mutate({
                                world: props.worldSelected.id.name,
                                gamemode: props.gamemodeSelected.name,
                                replay: bytesToBase64(ReplayModel.encode(replay).finish()),
                            })
                        },
                    },
                }}
            />

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
                        onClick={() => void props.onCancel()}
                    >
                        <StopSvg width="16" height="16" />
                    </button>
                </Navbar>
            </div>
        </div>
    )
}
