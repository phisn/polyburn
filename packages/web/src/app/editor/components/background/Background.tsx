import { Html } from "@react-three/drei"
import { useState } from "react"
import { Point } from "runtime/src/model/world/Point"
import { levelNew } from "../../entities/level/mutations/levelNew"
import { rocketNew } from "../../entities/rocket/mutations/rocketNew"
import { shapeNew } from "../../entities/shape/mutations/shapeNew"
import { useEditorStore } from "../../store/EditorStore"
import { ConsumeEvent, Priority, useEventListener } from "../../store/EventStore"

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
                <ul
                    className="menu bg-base-200 rounded-box absolute left-2 top-2 w-56"
                    onContextMenu={e => e.preventDefault()}
                >
                    <li>
                        <a
                            onClick={() => {
                                dispatchMutation(shapeNew({ ...mode.position }))
                                setMode({ type: "none" })
                            }}
                        >
                            Create Shape
                        </a>
                    </li>
                    <li>
                        <a
                            onClick={() => {
                                dispatchMutation(rocketNew({ ...mode.position }, 0))
                                setMode({ type: "none" })
                            }}
                        >
                            Create Rocket
                        </a>
                    </li>
                    <li>
                        <a
                            onClick={() => {
                                dispatchMutation(levelNew({ ...mode.position }, 0))
                                setMode({ type: "none" })
                            }}
                        >
                            Create Level
                        </a>
                    </li>
                </ul>
            </Html>
        )
    }

    return <></>
}
