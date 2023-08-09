import { Html } from "@react-three/drei"
import { useState } from "react"
import { Point } from "runtime/src/model/world/Point"
import { useEditorStore } from "../../store/EditorStore"
import { ConsumeEvent, Priority, useEventListener } from "../../store/EventStore"
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
            <Html as="div" position={[mode.position.x, mode.position.y, priority]}>
                <CreateEntityMenu
                    position={mode.position}
                    dispatchMutation={dispatchMutation}
                    onCancel={() => setMode({ type: "none" })}
                />
            </Html>
        )
    }

    return <></>
}
