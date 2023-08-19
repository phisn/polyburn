import { Svg } from "@react-three/drei"
import { Suspense, useRef, useState } from "react"
import { Euler, MeshBasicMaterial, Object3D } from "three"
import {
    entityGraphicRegistry,
    isPointInsideEntity,
} from "../../../../../game/runtime-view/graphics/EntityGraphicRegistry"
import { EntityGraphicType } from "../../../../../game/runtime-view/graphics/EntityGraphicType"
import { EntityContextMenu } from "../../../components/GroupContextMenu"
import { ConsumeEvent, Priority, useEventListener } from "../../../store/EventStore"
import { RocketMode } from "../Rocket"
import { RocketState } from "../RocketState"

export interface RocketModeNone {
    type: "none"
}

export function RocketInNone(props: {
    state: RocketState
    mode: RocketModeNone
    setMode: (mode: RocketMode) => void
}) {
    const graphicEntry = entityGraphicRegistry[EntityGraphicType.Rocket]
    const svgRef = useRef<Object3D>()

    const [hovered, setHovered] = useState(false)
    const [showRocketDialog, setShowRocketDialog] = useState<{ x: number; y: number } | undefined>()

    useEventListener(
        event => {
            if (!svgRef.current) {
                return
            }

            if (setShowRocketDialog && (event.leftButtonClicked || event.rightButtonClicked)) {
                setShowRocketDialog(undefined)
            }

            if (event.consumed) {
                setHovered(false)

                return
            }

            const isInside = isPointInsideEntity(
                event.position,
                { x: props.state.position.x, y: props.state.position.y },
                props.state.rotation,
                EntityGraphicType.Rocket,
            )

            setHovered(isInside)

            if (isInside) {
                if (event.leftButtonClicked) {
                    document.body.style.cursor = "grabbing"

                    props.setMode({
                        type: "moving",
                        offsetPosition: {
                            x: props.state.position.x - event.positionInGrid.x,
                            y: props.state.position.y - event.positionInGrid.y,
                        },
                    })
                } else if (event.rightButtonClicked) {
                    setShowRocketDialog({
                        x: event.position.x + 0.1,
                        y: event.position.y - 0.1,
                    })
                } else {
                    document.body.style.cursor = "grab"
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
                    fillMaterial={hovered ? new MeshBasicMaterial({ color: "#ffff55" }) : undefined}
                />
            </Suspense>
            {showRocketDialog && (
                <EntityContextMenu state={props.state} position={showRocketDialog} />
            )}
        </>
    )
}
