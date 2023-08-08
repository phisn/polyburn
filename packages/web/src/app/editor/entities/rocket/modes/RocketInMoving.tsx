import { Svg } from "@react-three/drei"
import { Suspense, useRef } from "react"
import { EntityType } from "runtime/src/core/common/EntityType"
import { Euler, Object3D } from "three"
import { entityGraphicRegistry } from "../../../../../game/runtime-view/graphics/EntityGraphicRegistry"
import { useEditorStore } from "../../../store/EditorStore"
import { ConsumeEvent, Priority, useEventListener } from "../../../store/EventStore"
import { RocketMode } from "../Rocket"
import { RocketState } from "../RocketState"

export interface ModeMoving {
    type: "moving"
    start: { x: number; y: number }
}

export function RocketInMoving(props: {
    state: RocketState
    mode: ModeMoving
    setMode: (mode: RocketMode) => void
}) {
    const graphicEntry = entityGraphicRegistry[EntityType.Rocket]

    const svgRef = useRef<Object3D>()
    const positionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

    const dispatchMutation = useEditorStore(store => store.mutation)

    useEventListener(event => {
        if (!svgRef.current) {
            return
        }

        if (event.consumed) {
            if (event.leftButtonClicked || event.rightButtonClicked) {
                props.setMode({ type: "none" })
            }

            return
        }

        if (event.leftButtonDown && event.shiftKey) {
            positionRef.current.x = props.mode.offsetPosition.x + event.positionInGrid.x
            positionRef.current.y = props.mode.offsetPosition.y + event.positionInGrid.y

            meshRef.current.position.set(
                positionRef.current.x,
                positionRef.current.y,
                Priority.Action,
            )

            window.document.body.style.cursor = "grabbing"
        } else {
            props.mode.dead = true

            if (event.shiftKey) {
                window.document.body.style.cursor = "grab"
            }

            dispatchMutation(shapeMove(props.state, positionRef.current))
            props.setMode({ type: "selected" })
        }

        return ConsumeEvent
    }, Priority.Action)

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
        </>
    )
}
