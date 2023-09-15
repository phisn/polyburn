import { Navbar } from "../../../common/components/Navbar"
import { StopSvg } from "../../../common/components/inline-svg/Stop"
import { GameHandler, GameHandlerProps } from "./GameHandler"
import { ReplayHandler, ReplayHandlerProps } from "./ReplayHandler"

export type PlayerHandlerProps = GameHandlerProps | ReplayHandlerProps

export function Player(props: {
    handler: GameHandlerProps | ReplayHandlerProps
    onCancel: () => void
}) {
    return (
        <div className="absolute inset-0">
            {props.handler.type === "game" && <GameHandler {...props.handler} />}
            {props.handler.type === "replay" && <ReplayHandler {...props.handler} />}

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
