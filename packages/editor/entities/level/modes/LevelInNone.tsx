import { Svg } from "@react-three/drei"
import { Suspense, useRef, useState } from "react"
import { Euler, MeshBasicMaterial, Object3D } from "three"
import { entityGraphicRegistry } from "../../../../../game/runtime-view/graphics-assets/entity-graphic-registry"
import { EntityGraphicType } from "../../../../../game/runtime-view/graphics-assets/entity-graphic-type"
import { EntityContextMenu } from "../../../components/GroupContextMenu"
import { isPointInsideEntity } from "../../../models/is-point-inside-entity"
import { Priority, SubPriority } from "../../../models/priority"
import { ConsumeEvent, useEventListener } from "../../../store/EventStore"
import { LevelMode } from "../Level"
import { LevelCameraLines } from "../LevelCameraLines"
import { LevelCameraColor, LevelCameraHoverColor } from "../level-colors"
import { LevelState } from "../level-state"

export interface LevelModeNone {
    type: "none"
}

export function LevelInNone(props: {
    state: LevelState
    mode: LevelModeNone
    setMode: (mode: LevelMode) => void
}) {
    const graphicEntry = entityGraphicRegistry[EntityGraphicType.RedFlag]
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

            const isInside = isPointInsideEntity(
                event.position,
                props.state.position,
                props.state.rotation,
                EntityGraphicType.RedFlag,
            )

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
        Priority.Normal + SubPriority.Level,
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
                        Priority.Normal + SubPriority.Level + (hovered ? 0.001 : 0),
                    ]}
                    rotation={new Euler(0, 0, props.state.rotation)}
                    src={graphicEntry.src}
                    scale={graphicEntry.scale}
                    fillMaterial={
                        hovered || showLevelDialog
                            ? new MeshBasicMaterial({
                                  color: "#ffff55",
                              })
                            : undefined
                    }
                />
            </Suspense>

            {showLevelDialog && (
                <EntityContextMenu
                    state={props.state}
                    position={showLevelDialog}
                    onCancel={() => setShowLevelDialog(undefined)}
                />
            )}

            <LevelCameraLines
                dashed={!(hovered || showLevelDialog)}
                state={props.state}
                color={hovered || showLevelDialog ? LevelCameraHoverColor : LevelCameraColor}
                priority={Priority.Normal + SubPriority.Level + (hovered ? 0.001 : 0)}
            />
        </>
    )
}
