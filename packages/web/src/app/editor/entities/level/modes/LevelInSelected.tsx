import { Svg } from "@react-three/drei"
import { Suspense, useRef, useState } from "react"
import { EntityType } from "runtime/src/core/common/EntityType"
import { FlagEntityModel } from "runtime/src/model/world/FlagEntityModel"
import { Euler, Object3D } from "three"

import {
    entityGraphicRegistry,
    isPointInsideEntity,
} from "../../../../../game/runtime-view/graphics/EntityGraphicRegistry"
import { EntityContextMenu } from "../../../components/GroupContextMenu"
import { ConsumeEvent, Priority, useEventListener } from "../../../store/EventStore"
import { CameraSide } from "../CameraSide"
import { LevelMode } from "../Level"
import { LevelCameraLines } from "../LevelCameraLines"
import { LevelState, findCameraLineCloseTo } from "../LevelState"

export interface LevelModeSelected {
    type: "selected"
}

export function LevelInSelected(props: {
    state: LevelState
    mode: LevelModeSelected
    setMode: (mode: LevelMode) => void
}) {
    const graphicEntry = entityGraphicRegistry["Green Flag"]
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

            const flag: FlagEntityModel = {
                type: EntityType.Level,

                position: props.state.position,
                rotation: props.state.rotation,

                cameraTopLeft: { x: 0, y: 0 },
                cameraBottomRight: { x: 0, y: 0 },

                captureLeft: 0,
                captureRight: 0,
            }

            const isInside = isPointInsideEntity(event.position, flag)

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
        Priority.Selected,
        true,
    )

    return (
        <>
            <Suspense>
                <Svg
                    ref={svgRef as any}
                    position={[props.state.position.x, props.state.position.y, 0]}
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
                    color={"orange"}
                    priority={Priority.Selected}
                />
            )}
            {cameraHovered?.side !== "all" && (
                <LevelCameraLines
                    state={props.state}
                    color={"blue"}
                    priority={Priority.Selected}
                    colorCustom={cameraHovered?.side && { [cameraHovered.side]: "orange" }}
                />
            )}
        </>
    )
}
