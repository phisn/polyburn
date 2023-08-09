import { useState } from "react"
import { LevelState } from "./LevelState"
import { LevelInMoving, LevelModeMoving } from "./modes/LevelInMoving"
import { LevelInNone, LevelModeNone } from "./modes/LevelInNone"

export type LevelMode = LevelModeNone | LevelModeMoving

export function Level(props: { state: LevelState }) {
    const [mode, setMode] = useState<LevelMode>({ type: "none" })

    return (
        <>
            {mode.type === "none" && (
                <LevelInNone state={props.state} mode={mode} setMode={setMode} />
            )}
            {mode.type === "moving" && (
                <LevelInMoving state={props.state} mode={mode} setMode={setMode} />
            )}
        </>
    )
}
