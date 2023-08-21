import { Svg } from "@react-three/drei"
import { Suspense, useRef, useState } from "react"
import { Euler, Object3D } from "three"
import { entityGraphicRegistry } from "../../../../../game/runtime-view/graphics/EntityGraphicRegistry"
import { EntityGraphicType } from "../../../../../game/runtime-view/graphics/EntityGraphicType"
import { EntityContextMenu } from "../../../components/GroupContextMenu"
import { Priority, SubPriority } from "../../../models/Priority"
import { isPointInsideEntity } from "../../../models/isPointInsideEntity"
import { ConsumeEvent, useEventListener } from "../../../store/EventStore"
import { CameraSide } from "../CameraSide"
import { LevelMode } from "../Level"
import { LevelCameraLines } from "../LevelCameraLines"
import { LevelCameraDragColor, LevelCameraSelectColor } from "../LevelColors"
import { LevelState, findCameraLineCloseTo } from "../LevelState"

export interface LevelModeSelected {
    type: "selected"
}

export function LevelInSelected(props: {
    state: LevelState
    mode: LevelModeSelected
    setMode: (mode: LevelMode) => void
}) {
    const graphicEntry = entityGraphicRegistry[EntityGraphicType.GreenFlag]
    const svgRef = useRef<Object3D>()

    const [showLevelDialog, setShowLevelDialog] = useState<{ x: number; y: number } | undefined>()

    interface CameraHovered {
        side: CameraSide | "all"
    }

    const [cameraHovered, setCameraHovered] = useState<CameraHovered | undefined>()

    useEventListener(
        event => {
            if (showLevelDialog && (event.leftButtonClicked || event.rightButtonClicked)) {
                setShowLevelDialog(undefined)
            }

            if (event.consumed) {
                if (event.leftButtonClicked || event.rightButtonClicked) {
                    props.setMode({ type: "none" })
                }

                return
            }

            const line = findCameraLineCloseTo(props.state, event.positionInGrid)

            if (line) {
                if (event.leftButtonClicked) {
                    document.body.style.cursor = "grabbing"

                    if (event.shiftKey) {
                        props.setMode({
                            type: "movingCamera",
                            offset: {
                                x: event.positionInGrid.x,
                                y: event.positionInGrid.y,
                            },
                        })
                    } else {
                        props.setMode({
                            type: "movingCameraLine",
                            side: line,
                        })
                    }
                } else if (event.shiftKey) {
                    document.body.style.cursor = "grab"
                    setCameraHovered({ side: "all" })
                } else {
                    document.body.style.cursor = "grab"
                    setCameraHovered({ side: line })
                }

                return ConsumeEvent
            } else {
                setCameraHovered(undefined)
            }

            const isInside = isPointInsideEntity(
                event.position,
                props.state.position,
                props.state.rotation,
                EntityGraphicType.GreenFlag,
            )

            if (isInside) {
                if (event.rightButtonClicked) {
                    setShowLevelDialog({
                        x: event.position.x + 0.1,
                        y: event.position.y - 0.1,
                    })
                } else if (event.shiftKey) {
                    if (event.leftButtonClicked) {
                        document.body.style.cursor = "grabbing"

                        props.setMode({
                            type: "moving",
                            previousMode: { type: "selected" },
                        })
                    } else {
                        document.body.style.cursor = "grab"
                    }
                }

                return ConsumeEvent
            } else {
                if (event.leftButtonClicked || event.rightButtonClicked) {
                    props.setMode({ type: "none" })
                }
            }
        },
        Priority.Selected + SubPriority.Level,
        true,
    )

    return (
        <>
            <Suspense>
                <Svg
                    ref={svgRef as any}
                    position={[
                        props.state.position.x,
                        props.state.position.y,
                        Priority.Selected + SubPriority.Level,
                    ]}
                    rotation={new Euler(0, 0, props.state.rotation)}
                    src={graphicEntry.src}
                    scale={graphicEntry.scale}
                />
            </Suspense>

            {showLevelDialog && (
                <EntityContextMenu state={props.state} position={showLevelDialog} />
            )}

            {cameraHovered?.side === "all" && (
                <LevelCameraLines
                    state={props.state}
                    color={"red"}
                    priority={Priority.Selected + SubPriority.Level}
                />
            )}
            {cameraHovered?.side !== "all" && (
                <LevelCameraLines
                    state={props.state}
                    color={LevelCameraSelectColor}
                    priority={Priority.Selected + SubPriority.Level}
                    colorCustom={
                        cameraHovered?.side && { [cameraHovered.side]: LevelCameraDragColor }
                    }
                />
            )}
        </>
    )
}
