import { Svg } from "@react-three/drei"
import { Suspense, useRef } from "react"
import { RocketEntityComponents } from "runtime/src/core/rocket/RocketEntity"
import { Object3D } from "three"

import { EntityWith } from "runtime-framework"
import { changeAnchor } from "runtime/src/model/world/changeAnchor"
import { WebappComponents } from "../../runtime-webapp/WebappComponents"
import { useGraphicUpdate } from "../../store/useGraphicUpdate"
import { entityGraphicRegistry } from "../graphics-assets/EntityGraphicRegistry"
import { EntityGraphicType } from "../graphics-assets/EntityGraphicType"
import { withEntityStore } from "./withEntityStore"

function RocketGraphic(props: {
    entity: EntityWith<WebappComponents, (typeof RocketEntityComponents)[number] | "interpolation">
}) {
    const svgRef = useRef<Object3D>()
    // const lineRef = useRef<any>(null!)

    const graphicEntry = entityGraphicRegistry[EntityGraphicType.Rocket]

    useGraphicUpdate(() => {
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

export const RocketGraphics = withEntityStore(
    RocketGraphic,
    "interpolation",
    ...RocketEntityComponents,
)
