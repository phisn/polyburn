import { Svg } from "@react-three/drei"
import { Suspense, useRef } from "react"
import { MeshBasicMaterial, Object3D } from "three"

import { changeAnchor } from "runtime/src/model/world/changeAnchor"
import { EntityWith } from "../../../../../runtime-framework/src/NarrowProperties"
import { WebappComponents } from "../../runtime-webapp/WebappComponents"
import { useGraphicUpdate } from "../../store/useGraphicUpdate"
import { entityGraphicRegistry } from "../graphics-assets/EntityGraphicRegistry"
import { EntityGraphicType } from "../graphics-assets/EntityGraphicType"
import { withEntityStore } from "./withEntityStore"

export function ReplayGraphic(props: { entity: EntityWith<WebappComponents, "replay"> }) {
    const entity = props.entity

    const svgRef = useRef<Object3D>()

    const graphicEntry = entityGraphicRegistry[EntityGraphicType.Rocket]

    useGraphicUpdate(() => {
        /*
        if (!props.entity.has("interpolation")) {
            console.error("Entity is missing interpolation component")
            return
        }
        */

        // svgref might be undefined while in suspense
        if (svgRef.current === undefined) {
            return
        }

        const positionAnchored = changeAnchor(
            entity.components.replay.prepared.frames[entity.components.replay.frame].position,
            entity.components.replay.prepared.frames[entity.components.replay.frame].rotation,
            graphicEntry.size,
            { x: 0.5, y: 0.5 },
            { x: 0, y: 1 },
        )

        svgRef.current.position.set(positionAnchored.x, positionAnchored.y, 1)
        svgRef.current.rotation.set(
            0,
            0,
            entity.components.replay.prepared.frames[entity.components.replay.frame].rotation,
        )
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

export const ReplayGraphics = withEntityStore(ReplayGraphic, "replay")
