import { useState } from "react"
import { RocketState } from "./RocketState"
import { ModeMoving, RocketInMoving } from "./modes/RocketInMoving"
import { ModeNone, RocketInNone } from "./modes/RocketInNone"

export type RocketMode = ModeNone | ModeMoving

export function Rocket(props: { state: RocketState }) {
    const [mode, setMode] = useState<RocketMode>({ type: "none" })

    return (
        <>
            {mode.type === "none" && (
                <RocketInNone state={props.state} mode={mode} setMode={setMode} />
            )}
            {mode.type === "moving" && (
                <RocketInMoving state={props.state} mode={mode} setMode={setMode} />
            )}
        </>
    )
}
