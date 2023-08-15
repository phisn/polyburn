import { Svg } from "@react-three/drei"
import { Suspense, useRef } from "react"
import { Euler } from "three"
import { entityGraphicRegistry } from "../../../../../game/runtime-view/graphics/EntityGraphicRegistry"
import { EntityGraphicType } from "../../../../../game/runtime-view/graphics/EntityGraphicType"
import { useEditorStore } from "../../../store/EditorStore"
import { ConsumeEvent, Priority, useEventListener } from "../../../store/EventStore"
import { CameraSide } from "../CameraSide"
import { LevelMode } from "../Level"
import { LevelCameraLines, LevelCameraLinesRef } from "../LevelCameraLines"
import { LevelState } from "../LevelState"
import { levelChangeCameraBoundsByMouse } from "../mutations/levelChangeCameraBounds"

export interface LevelModeMovingCamera {
    type: "movingCamera"
    side: CameraSide
}

export function LevelInMovingCamera(props: {
    state: LevelState
    mode: LevelModeMovingCamera
    setMode: (mode: LevelMode) => void
}) {
    const graphicEntry = entityGraphicRegistry[EntityGraphicType.GreenFlag]

    const cameraLinesRef = useRef<LevelCameraLinesRef>(null)

    const positionRef = useRef({
        position: { ...props.state.position },
        rotation: props.state.rotation,
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
        Priority.Action,
        true,
    )

    return (
        <>
            <Suspense>
                <Svg
                    position={[positionRef.current.position.x, positionRef.current.position.y, 0]}
                    rotation={new Euler(0, 0, positionRef.current.rotation)}
                    src={graphicEntry.src}
                    scale={graphicEntry.scale}
                />
            </Suspense>

            <LevelCameraLines
                ref={cameraLinesRef}
                color={"purple"}
                state={props.state}
                priority={Priority.Action}
                colorCustom={{ [props.mode.side]: "orange" }}
            />
        </>
    )
}
