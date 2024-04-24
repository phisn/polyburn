import { useEffect, useState } from "react"
import { Navbar } from "../../src/common/components/Navbar"
import { ArrowClockwise } from "../../src/common/components/inline-svg/ArrowClockwise"
import { StopSvg } from "../../src/common/components/inline-svg/Stop"
import { GameHandler, GameHandlerProps } from "./GameHandler"
import { ReplayHandler, ReplayHandlerProps } from "./ReplayHandler"

export type PlayerHandlerProps = GameHandlerProps | ReplayHandlerProps

export function Player(props: {
    handler: GameHandlerProps | ReplayHandlerProps
    onCancel: () => void
}) {
    const [counter, setCounter] = useState(0)

    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (e.key === "r") {
                setCounter(counter + 1)
            }
        }

        window.addEventListener("keydown", listener)

        return () => {
            window.removeEventListener("keydown", listener)
        }
    }, [counter])

    return (
        <div className="absolute inset-0">
            {props.handler.type === "game" && <GameHandler key={counter} {...props.handler} />}
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
                    <div className="join">
                        <button
                            className="join-item btn btn-square btn-ghost"
                            onClick={() => void props.onCancel()}
                        >
                            <StopSvg width="16" height="16" />
                        </button>
                        {props.handler.type === "game" && (
                            <button
                                className="join-item btn btn-square btn-ghost"
                                onClick={() => setCounter(counter + 1)}
                            >
                                <ArrowClockwise width="16" height="16" />
                            </button>
                        )}
                    </div>
                </Navbar>
            </div>
        </div>
    )
}
