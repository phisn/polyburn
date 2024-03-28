import { useState } from "react"
import { ShapeInMoving, ShapeModeMoving } from "./modes/ShapeInMoving"
import { ShapeInNone, ShapeModeNone } from "./modes/ShapeInNone"
import { ShapeInSelected, ShapeModeSelected } from "./modes/ShapeInSelected"
import { ShapeInVertex, ShapeModeVertex } from "./modes/ShapeInVertex"
import { ShapeState } from "./shape-state"

export type ShapeMode = ShapeModeMoving | ShapeModeNone | ShapeModeSelected | ShapeModeVertex

export function Shape(props: { state: ShapeState }) {
    const [mode, setMode] = useState<ShapeMode>({ type: "none" })

    return (
        <>
            {mode.type === "none" && (
                <ShapeInNone state={props.state} mode={mode} setMode={setMode} />
            )}
            {mode.type === "moving" && (
                <ShapeInMoving state={props.state} mode={mode} setMode={setMode} />
            )}
            {mode.type === "selected" && (
                <ShapeInSelected state={props.state} mode={mode} setMode={setMode} />
            )}
            {mode.type === "vertex" && (
                <ShapeInVertex state={props.state} mode={mode} setMode={setMode} />
            )}
        </>
    )
}
