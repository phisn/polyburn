import { Svg } from "@react-three/drei"
import { Suspense, useRef } from "react"
import { EntityWith } from "runtime-framework"
import { changeAnchor } from "runtime/src/model/world/change-anchor"
import { MeshBasicMaterial, Object3D } from "three"
import { WebappComponents } from "../../runtime-extension/webapp-components"
import { useGraphicUpdate } from "../ViewUpdates"
import { entityGraphicRegistry } from "../graphics-assets/entity-graphic-registry"
import { EntityGraphicType } from "../graphics-assets/entity-graphic-type"
import { withEntityStore } from "./WithEntityStore"

export function ReplayGraphic(props: {
    entity: EntityWith<WebappComponents, "replay" | "interpolation">
}) {
    const svgRef = useRef<Object3D>()
    const graphicEntry = entityGraphicRegistry[EntityGraphicType.Rocket]

    useGraphicUpdate(() => {
        // svgref might be undefined while in suspense
        if (svgRef.current === undefined) {
            return
        }

        const positionAnchored = changeAnchor(
            props.entity.components.interpolation.position,
            props.entity.components.interpolation.rotation,
            graphicEntry.size,
            { x: 0.5, y: 0.5 },
            { x: 0, y: 1 },
        )

        svgRef.current.position.set(positionAnchored.x, positionAnchored.y, 1)
        svgRef.current.rotation.set(0, 0, props.entity.components.interpolation.rotation)
    })

    return (
        <Suspense>
            <Svg
                ref={svgRef as any}
                src={graphicEntry.src}
                scale={graphicEntry.scale}
                fillMaterial={
                    new MeshBasicMaterial({
                        transparent: true,
                        opacity: 0.5,
                    })
                }
            />
        </Suspense>
    )
}

export const ReplayGraphics = withEntityStore(ReplayGraphic, "replay", "interpolation")
