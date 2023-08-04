import { Svg } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { Suspense, useRef, useState } from "react"
import { EntityType } from "runtime/src/core/common/EntityType"
import { entityModelRegistry } from "runtime/src/model/world/EntityModelRegistry"
import { Object3D } from "three"
import { entityGraphicRegistry } from "../../../game/runtime-view/graphics/EntityGraphicRegistry"
import { Priority, useEventListener } from "../store/EventStore"

interface ModeNone {
    type: "none"
}

interface ModeMoving {
    type: "moving"
    start: { x: number; y: number }
}

type Mode = ModeNone | ModeMoving

export function Rocket() {
    const entry = entityModelRegistry[EntityType.Rocket]
    const graphicEntry = entityGraphicRegistry[EntityType.Rocket]

    const svgRef = useRef<Object3D>()

    const [mode, setMode] = useState<Mode>({ type: "none" })
    const [hovered, setHovered] = useState(false)

    const raycaster = useThree(state => state.raycaster)
    const camera = useThree(state => state.camera)
    const canvasSize = useThree(state => state.size)

    useEventListener(
        event => {
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
                    // raycaster.setFromCamera(event.positionInWindow, camera)
                    // const isPointInside = svgRef.current?.raycast(ev)

                    break
                case "moving":
                    break
            }
        },
        mode.type === "none" ? Priority.Normal : Priority.Action,
    )

    return (
        <>
            <Suspense>
                <Svg ref={svgRef as any} src={graphicEntry.src} scale={graphicEntry.scale} />
                {/*
            <line ref={lineRef}>
                <bufferGeometry />
                <lineBasicMaterial color={"#00ff00"} linewidth={10} />
            </line>
            */}
            </Suspense>
        </>
    )
}
