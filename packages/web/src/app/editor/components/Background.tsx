import { Html } from "@react-three/drei"
import { useState } from "react"
import { Point } from "runtime/src/model/world/Point"
import { ConsumeEvent, Priority, useEventListener } from "../store/EventStore"

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
                as="div"
                position={[mode.position.x, mode.position.y, priority]}
            >
                <ul
                    className="menu bg-base-200 rounded-box absolute left-2 top-2 w-56"
                    onContextMenu={e => e.preventDefault()}
                >
                    <li>
                        <a>Create Shape</a>
                    </li>
                    <li>
                        <a>Create Rocket</a>
                    </li>
                    <li>
                        <a>Create Level</a>
                    </li>
                </ul>
            </Html>
        )
    }

    return <></>
}
