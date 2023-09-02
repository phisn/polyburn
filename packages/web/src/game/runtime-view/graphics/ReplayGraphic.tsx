import { Svg } from "@react-three/drei"
import { Suspense, useRef } from "react"
import { MeshBasicMaterial, Object3D } from "three"

import { Entity } from "runtime-framework"
import { changeAnchor } from "runtime/src/model/world/changeAnchor"
import { useGraphicUpdate } from "../../store/useGraphicUpdate"
import { WebappComponents } from "../webapp-runtime/WebappComponents"
import { entityGraphicRegistry } from "./EntityGraphicRegistry"
import { EntityGraphicType } from "./EntityGraphicType"

export function ReplayGraphic(props: { entity: Entity<WebappComponents> }) {
    if (!props.entity.has("replay")) {
        throw new Error("Got invalid entity graphic type")
    }

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
