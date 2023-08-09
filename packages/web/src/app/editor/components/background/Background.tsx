import { Html } from "@react-three/drei"
import { useState } from "react"
import { EntityType } from "runtime/src/core/common/EntityType"
import { entityModelRegistry } from "runtime/src/model/world/EntityModelRegistry"
import { Point } from "runtime/src/model/world/Point"
import { ContextMenu } from "../../../../common/components/ContextMenu"
import { FlagSvg } from "../../../../common/components/inline-svg/Flag"
import { RocketSvg } from "../../../../common/components/inline-svg/Rocket"
import { TriangleSvg } from "../../../../common/components/inline-svg/Triangle"
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
        function spawnPositionForType(position: Point, type: EntityType) {
            return {
                x: position.x - entityModelRegistry[EntityType.Rocket].width / 2,
                y: position.y + entityModelRegistry[EntityType.Rocket].height / 2,
            }
        }

        return (
            <Html as="div" position={[mode.position.x, mode.position.y, priority]}>
                <ContextMenu>
                    <li>
                        <a
                            onClick={() => {
                                dispatchMutation(shapeNew({ ...mode.position }))
                                setMode({ type: "none" })
                            }}
                        >
                            <TriangleSvg width="16" height="16" />
                            Create Shape
                        </a>
                    </li>
                    <li>
                        <a
                            onClick={() => {
                                dispatchMutation(
                                    rocketNew(
                                        spawnPositionForType(mode.position, EntityType.Rocket),
                                        0,
                                    ),
                                )
                                setMode({ type: "none" })
                            }}
                        >
                            <RocketSvg width="16" height="16" />
                            Create Rocket
                        </a>
                    </li>
                    <li>
                        <a
                            onClick={() => {
                                dispatchMutation(
                                    levelNew(
                                        spawnPositionForType(mode.position, EntityType.Level),
                                        0,
                                    ),
                                )
                                setMode({ type: "none" })
                            }}
                        >
                            <FlagSvg width="16" height="16" />
                            Create Level
                        </a>
                    </li>
                </ContextMenu>
            </Html>
        )
    }

    return <></>
}
