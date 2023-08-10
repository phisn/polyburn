import { Svg } from "@react-three/drei"
import { Suspense, useRef } from "react"
import { EntityType } from "runtime/src/core/common/EntityType"
import { Euler, Object3D } from "three"
import { entityGraphicRegistry } from "../../../../../game/runtime-view/graphics/EntityGraphicRegistry"
import { EntityGraphicType } from "../../../../../game/runtime-view/graphics/EntityGraphicType"
import { findLocationForEntity } from "../../../models/EntityWithLocation"
import { useEditorStore } from "../../../store/EditorStore"
import { ConsumeEvent, Priority, useEventListener } from "../../../store/EventStore"
import { LevelMode } from "../Level"
import { LevelCameraLines } from "../LevelCameraLines"
import { LevelState } from "../LevelState"
import { levelMove } from "../mutations/levelMove"

export interface LevelModeMovingCamera {
    type: "moving"
    offsetPosition: { x: number; y: number }
    previousMode: LevelMode
}

export function LevelInMovingCamera(props: {
    state: LevelState
    mode: LevelModeMovingCamera
    setMode: (mode: LevelMode) => void
}) {
    const graphicEntry = entityGraphicRegistry[EntityGraphicType.GreenFlag]

    const svgRef = useRef<Object3D>()

    const positionRef = useRef({
        position: { ...props.state.position },
        rotation: props.state.rotation,
    })

    const dispatchMutation = useEditorStore(store => store.mutation)
    const world = useEditorStore(store => store.state.world)

    useEventListener(
        event => {
            if (event.consumed) {
                if (event.leftButtonClicked || event.rightButtonClicked) {
                    props.setMode({ type: "none" })
                }

                return
            }

            if (event.leftButtonDown) {
                updateLocation(...findLocationForEntity(world, event, EntityType.Level))
                window.document.body.style.cursor = "grabbing"
            } else {
                window.document.body.style.cursor = "grab"

                dispatchMutation(
                    levelMove(
                        props.state,
                        positionRef.current.position,
                        positionRef.current.rotation,
                    ),
                )

                props.setMode(props.mode.previousMode)
            }

            function updateLocation(x: number, y: number, rotation: number) {
                positionRef.current.position.x = x
                positionRef.current.position.y = y
                positionRef.current.rotation = rotation

                svgRef.current?.position.set(
                    positionRef.current.position.x,
                    positionRef.current.position.y,
                    Priority.Action,
                )

                svgRef.current?.rotation.set(0, 0, positionRef.current.rotation)
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
                    ref={svgRef as any}
                    position={[positionRef.current.position.x, positionRef.current.position.y, 0]}
                    rotation={new Euler(0, 0, positionRef.current.rotation)}
                    src={graphicEntry.src}
                    scale={graphicEntry.scale}
                />
            </Suspense>

            <LevelCameraLines
                color={props.mode.previousMode.type === "none" ? "purple" : "green"}
                state={props.state}
                priority={Priority.Action}
            />
        </>
    )
}
