import { Html } from "@react-three/drei"
import { useState } from "react"
import { Point } from "runtime/src/model/Point"
import { Priority } from "../../models/priority"
import { useEditorStore } from "../../store/EditorStore"
import { ConsumeEvent, useEventListener } from "../../store/EventStore"
import { CreateEntityMenu } from "./CreateEntityMenu"

interface ModeNone {
    type: "none"
}

interface ModeContextMenu {
    type: "contextMenu"
    position: Point
}

export function Background() {
    const [mode, setMode] = useState<ModeNone | ModeContextMenu>({
        type: "none",
    })

    const priority = mode.type === "none" ? Priority.Fallback : Priority.Action

    const dispatchMutation = useEditorStore(store => store.mutation)

    useEventListener(event => {
        if (event.consumed) {
            return
        }

        switch (mode.type) {
            case "none":
                if (event.rightButtonClicked) {
                    setMode({ type: "contextMenu", position: event.position })
                    return ConsumeEvent
                }

                break
            case "contextMenu":
                if (event.leftButtonClicked || event.rightButtonClicked) {
                    setMode({ type: "none" })
                }

                break
        }
    }, priority)

    if (mode.type === "contextMenu") {
        return (
            <Html
                wrapperClass="pointer-events-none"
                position={[mode.position.x, mode.position.y, priority + 0.01]}
            >
                <div className="pointer-events-auto" onContextMenu={e => e.preventDefault()}>
                    <CreateEntityMenu
                        position={mode.position}
                        dispatchMutation={dispatchMutation}
                        onCancel={() => setMode({ type: "none" })}
                    />
                </div>
            </Html>
        )
    }

    return <></>
}
