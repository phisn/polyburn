import { Svg } from "@react-three/drei"
import { Suspense, useRef } from "react"
import { RocketEntityComponents } from "runtime/src/core/rocket/RocketEntity"
import { Object3D } from "three"

import { Entity } from "runtime-framework"
import { changeAnchor } from "runtime/src/model/changeAnchor"
import { useGraphicUpdate } from "../../store/useGraphicUpdate"
import { WebappComponents } from "../webapp-runtime/WebappComponents"
import { entityGraphicRegistry } from "./EntityGraphicRegistry"
import { EntityGraphicType } from "./EntityGraphicType"

export function RocketGraphic(props: { entity: Entity<WebappComponents> }) {
    if (!props.entity.has(...RocketEntityComponents)) {
        throw new Error("Got invalid entity graphic type")
    }

    const svgRef = useRef<Object3D>()
    // const lineRef = useRef<any>(null!)

    const graphicEntry = entityGraphicRegistry[EntityGraphicType.Rocket]

    useGraphicUpdate(() => {
        if (!props.entity.has("interpolation")) {
            console.error("Entity is missing interpolation component")
            return
        }

        // svgref might be undefined while in suspense
        if (svgRef.current === undefined) {
            return
        }

        // console.log(`rocket position { x: ${props.entity.components.interpolation.position.y}, y: ${props.entity.components.interpolation.position.y} }`)

        /*console.log(
            "updating x=" +
                props.entity.components.interpolation.position.x +
                " at " +
                performance.now(),
        )
        */

        const positionAnchored = changeAnchor(
            props.entity.components.interpolation.position,
            props.entity.components.interpolation.rotation,
            graphicEntry.size,
            { x: 0.5, y: 0.5 },
            { x: 0, y: 1 },
        )

        svgRef.current.position.set(positionAnchored.x, positionAnchored.y, 1)
        svgRef.current.rotation.set(0, 0, props.entity.components.interpolation.rotation)

        /*
        const positionMidAnchored = changeAnchor(
            point,
            rotation,
            size,
            { x: 0.5, y: 0.5 },
            { x: 0.5, y: 0.2 }
        )

        const positionBelowAnchored = changeAnchor(
            point,
            rotation,
            size,
            { x: 0.5, y: 0.5 },
            { x: 0.5, y: -1 }
        )

        lineRef.current.geometry.setFromPoints([
            new Vector3(positionMidAnchored.x, positionMidAnchored.y, 0),
            new Vector3(positionBelowAnchored.x, positionBelowAnchored.y, 0),
        ])
        */
    })

    return (
        <Suspense>
            <Svg ref={svgRef as any} src={graphicEntry.src} scale={graphicEntry.scale} />
            {/*
            <line ref={lineRef}>
                <bufferGeometry />
                <lineBasicMaterial color={"#00ff00"} linewidth={10} />
            </line>
            */}
        </Suspense>
    )
}
