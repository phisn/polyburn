import { Svg } from "@react-three/drei"
import { Suspense, useRef } from "react"
import { Euler } from "three"
import { entityGraphicRegistry } from "../../../../../game/runtime-view/graphics/EntityGraphicRegistry"
import { EntityGraphicType } from "../../../../../game/runtime-view/graphics/EntityGraphicType"
import { useEditorStore } from "../../../store/EditorStore"
import { ConsumeEvent, Priority, useEventListener } from "../../../store/EventStore"
import { LevelMode } from "../Level"
import { LevelCameraLines, LevelCameraLinesRef } from "../LevelCameraLines"
import { LevelState } from "../LevelState"
import { levelChangeCameraBounds } from "../mutations/levelChangeCameraBounds"

export interface LevelModeMovingCamera {
    type: "movingCamera"
    offset: { x: number; y: number }
}

export function LevelInMovingCamera(props: {
    state: LevelState
    mode: LevelModeMovingCamera
    setMode: (mode: LevelMode) => void
}) {
    const graphicEntry = entityGraphicRegistry[EntityGraphicType.GreenFlag]

    const cameraLinesRef = useRef<LevelCameraLinesRef>(null)

    const boundsRef = useRef({
        topLeft: { ...props.state.cameraTopLeft },
        bottomRight: { ...props.state.cameraBottomRight },
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

                const dx = event.positionInGrid.x - props.mode.offset.x
                const dy = event.positionInGrid.y - props.mode.offset.y

                boundsRef.current.topLeft.x = props.state.cameraTopLeft.x + dx
                boundsRef.current.topLeft.y = props.state.cameraTopLeft.y + dy

                boundsRef.current.bottomRight.x = props.state.cameraBottomRight.x + dx
                boundsRef.current.bottomRight.y = props.state.cameraBottomRight.y + dy

                cameraLinesRef.current?.setCorners(
                    boundsRef.current.topLeft,
                    boundsRef.current.bottomRight,
                )
            } else {
                window.document.body.style.cursor = "grab"

                dispatchMutation(
                    levelChangeCameraBounds(
                        props.state,
                        boundsRef.current.topLeft,
                        boundsRef.current.bottomRight,
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
                    position={[props.state.position.x, props.state.position.y, 0]}
                    rotation={new Euler(0, 0, props.state.rotation)}
                    src={graphicEntry.src}
                    scale={graphicEntry.scale}
                />
            </Suspense>

            <LevelCameraLines
                ref={cameraLinesRef}
                color={"orange"}
                state={props.state}
                priority={Priority.Action}
            />

            <LevelCameraLines
                color={"purple"}
                dashed
                state={props.state}
                priority={Priority.Selected}
            />
        </>
    )
}
