import { Svg } from "@react-three/drei"
import { Suspense, useRef, useState } from "react"
import { EntityType } from "runtime/src/core/common/EntityType"
import { FlagEntityModel } from "runtime/src/model/world/FlagEntityModel"
import { Euler, MeshBasicMaterial, Object3D } from "three"
import {
    entityGraphicRegistry,
    isPointInsideEntity,
} from "../../../../../game/runtime-view/graphics/EntityGraphicRegistry"
import { EntityContextMenu } from "../../../components/GroupContextMenu"
import { ConsumeEvent, Priority, useEventListener } from "../../../store/EventStore"
import { LevelMode } from "../Level"
import { LevelCameraLines } from "../LevelCameraLines"
import { LevelState } from "../LevelState"

export interface LevelModeNone {
    type: "none"
}

export function LevelInNone(props: {
    state: LevelState
    mode: LevelModeNone
    setMode: (mode: LevelMode) => void
}) {
    const graphicEntry = entityGraphicRegistry[EntityType.Level]
    const svgRef = useRef<Object3D>()

    const [showLevelDialog, setShowLevelDialog] = useState<{ x: number; y: number } | undefined>()
    const [hovered, setHovered] = useState(false)

    useEventListener(
        event => {
            if (!svgRef.current) {
                return
            }

            if (setShowLevelDialog && (event.leftButtonClicked || event.rightButtonClicked)) {
                setShowLevelDialog(undefined)
            }

            if (event.consumed) {
                setHovered(false)

                return
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
            setHovered(isInside)

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
                            previousMode: { type: "none" },
                        })
                    } else {
                        document.body.style.cursor = "grab"
                    }
                } else if (event.leftButtonClicked) {
                    props.setMode({
                        type: "selected",
                    })
                }

                return ConsumeEvent
            }
        },
        Priority.Normal,
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
                    fillMaterial={
                        hovered
                            ? new MeshBasicMaterial({
                                  color: "#ffff55",
                              })
                            : undefined
                    }
                />
            </Suspense>

            {showLevelDialog && (
                <EntityContextMenu state={props.state} position={showLevelDialog} />
            )}

            <LevelCameraLines
                dashed
                state={props.state}
                color={hovered ? "purple" : "orange"}
                priority={Priority.Normal}
            />
        </>
    )
}
