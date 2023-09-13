import { Svg } from "@react-three/drei"
import { Suspense, useRef } from "react"
import { Euler } from "three"
import { entityGraphicRegistry } from "../../../../../game/runtime-view/graphics-assets/EntityGraphicRegistry"
import { EntityGraphicType } from "../../../../../game/runtime-view/graphics-assets/EntityGraphicType"
import { Priority, SubPriority } from "../../../models/Priority"
import { useEditorStore } from "../../../store/EditorStore"
import { ConsumeEvent, useEventListener } from "../../../store/EventStore"
import { CameraSide } from "../CameraSide"
import { LevelMode } from "../Level"
import { LevelCameraLines, LevelCameraLinesRef } from "../LevelCameraLines"
import { LevelCameraDragColor, LevelCameraSelectColor } from "../LevelColors"
import { LevelState } from "../LevelState"
import { levelChangeCameraBoundsByMouse } from "../mutations/levelChangeCameraBounds"

export interface LevelModeMovingCameraLine {
    type: "movingCameraLine"
    side: CameraSide
}

export function LevelInMovingCameraLine(props: {
    state: LevelState
    mode: LevelModeMovingCameraLine
    setMode: (mode: LevelMode) => void
}) {
    const graphicEntry = entityGraphicRegistry[EntityGraphicType.GreenFlag]

    const cameraLinesRef = useRef<LevelCameraLinesRef>(null)

    const positionRef = useRef({
        position: { ...props.state.position },
    })

    const dispatchMutation = useEditorStore(store => store.mutation)

    useEventListener(
        event => {
            if (event.consumed) {
                if (event.leftButtonClicked || event.rightButtonClicked) {
                    props.setMode({ type: "none" })
                }

                return
            }

            if (event.leftButtonDown) {
                window.document.body.style.cursor = "grabbing"
                cameraLinesRef.current?.setLineTo(props.mode.side, event.positionInGrid)
                positionRef.current.position = event.positionInGrid
            } else {
                window.document.body.style.cursor = "grab"

                dispatchMutation(
                    levelChangeCameraBoundsByMouse(
                        props.state,
                        props.mode.side,
                        positionRef.current.position,
                    ),
                )

                props.setMode({ type: "selected" })
            }

            return ConsumeEvent
        },
        Priority.Action + SubPriority.Level,
        true,
    )

    return (
        <>
            <Suspense>
                <Svg
                    position={[
                        props.state.position.x,
                        props.state.position.y,
                        Priority.Action + SubPriority.Level,
                    ]}
                    rotation={new Euler(0, 0, props.state.rotation)}
                    src={graphicEntry.src}
                    scale={graphicEntry.scale}
                />
            </Suspense>

            <LevelCameraLines
                ref={cameraLinesRef}
                color={LevelCameraSelectColor}
                state={props.state}
                priority={Priority.Action + SubPriority.Level}
                colorCustom={{ [props.mode.side]: LevelCameraDragColor }}
                alwaysShowDashed={props.mode.side}
            />
        </>
    )
}
