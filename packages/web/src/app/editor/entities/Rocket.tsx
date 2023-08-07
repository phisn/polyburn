import { Svg } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { Suspense, useEffect, useRef, useState } from "react"
import { EntityType } from "runtime/src/core/common/EntityType"
import { entityModelRegistry } from "runtime/src/model/world/EntityModelRegistry"
import { MeshBasicMaterial, Object3D } from "three"
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
    const colorRef = useRef<MeshBasicMaterial>(new MeshBasicMaterial({ color: "#ffffff" }))

    const [mode, setMode] = useState<Mode>({ type: "none" })
    const [hovered, setHovered] = useState(false)

    const raycaster = useThree(state => state.raycaster)
    const pointer = useThree(state => state.pointer)

    const camera = useThree(state => state.camera)
    const canvasSize = useThree(state => state.size)

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
                    raycaster.setFromCamera(pointer, camera)

                    break
                case "moving":
                    break
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
                    src={graphicEntry.src}
                    scale={graphicEntry.scale}
                    fillMaterial={new MeshBasicMaterial({ color: hovered ? "#ff0000" : "#00ffff" })}
                    onPointerEnter={() => {
                        console.log("enter")
                    }}
                    onPointerOver={() => {
                        console.log("over")
                        setHovered(true)
                    }}
                    onPointerOut={() => {
                        console.log("out")
                        setHovered(false)
                    }}
                />
            </Suspense>
        </>
    )
}
