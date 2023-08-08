import { Svg } from "@react-three/drei"
import { Suspense, useEffect, useRef, useState } from "react"
import { EntityType } from "runtime/src/core/common/EntityType"
import { RocketEntityModel } from "runtime/src/model/world/EntityModel"
import { Euler, MeshBasicMaterial, Object3D } from "three"
import {
    entityGraphicRegistry,
    isPointInsideEntity,
} from "../../../../game/runtime-view/graphics/EntityGraphicRegistry"
import { ConsumeEvent, Priority, useEventListener } from "../../store/EventStore"
import { RocketState } from "./RocketState"

interface ModeNone {
    type: "none"
}

interface ModeMoving {
    type: "moving"
    start: { x: number; y: number }
}

type Mode = ModeNone | ModeMoving

export function Rocket(props: { state: RocketState }) {
    const graphicEntry = entityGraphicRegistry[EntityType.Rocket]

    const svgRef = useRef<Object3D>()
    const colorRef = useRef<MeshBasicMaterial>(new MeshBasicMaterial({ color: "#ffffff" }))

    const [mode, setMode] = useState<Mode>({ type: "none" })
    const [hovered, setHovered] = useState(false)

    useEventListener(
        event => {
            if (!svgRef.current) {
                return
            }

            if (event.consumed) {
                if (event.leftButtonClicked || event.rightButtonClicked) {
                    if (mode.type !== "none") {
                        setMode({ type: "none" })
                    }
                }

                setHovered(false)

                return
            }

            switch (mode.type) {
                case "none":
                    const rocket: RocketEntityModel = {
                        type: EntityType.Rocket,

                        position: props.state.position,
                        rotation: props.state.rotation,
                    }

                    const isInside = isPointInsideEntity(event.position, rocket)
                    setHovered(isInside)

                    if (isInside) {
                        if (event.leftButtonClicked) {
                            setMode({
                                type: "moving",
                                start: {
                                    x: props.state.position.x - event.positionInGrid.x,
                                    y: props.state.position.y - event.positionInGrid.y,
                                },
                            })
                        }

                        return ConsumeEvent
                    }

                    break
                case "moving":
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
            }
        },
        mode.type === "none" ? Priority.Normal : Priority.Action,
    )

    useEffect(() => {
        if (hovered) {
            console.log("hovered")
            colorRef.current.color.set("#ff0000")
            colorRef.current.needsUpdate = true
        } else {
            console.log("not hovered")
            colorRef.current.color.set("#00ffff")
            colorRef.current.needsUpdate = true
        }
    }, [hovered])

    return (
        <>
            <Suspense>
                <Svg
                    ref={svgRef as any}
                    position={[props.state.position.x, props.state.position.y, 0]}
                    rotation={new Euler(0, 0, props.state.rotation)}
                    src={graphicEntry.src}
                    scale={graphicEntry.scale}
                    fillMaterial={new MeshBasicMaterial({ color: hovered ? "#ff0000" : "#00ffff" })}
                />
            </Suspense>
        </>
    )
}
