import { Svg } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Suspense, useRef } from "react"
import { Entity } from "runtime-framework"
import { Object3D } from "three"

import { changeAnchor } from "../../../common/math"
import { entityModels } from "../../../model/world/EntityModels"
import { EntityType } from "../../../model/world/EntityType"
import { scale } from "../../../model/world/Size"
import { AddonComponents } from "../AddonComponents"
import { InterpolationComponent } from "../interpolation/InterpolationComponent"

export function RocketGraphic(props: { entity: Entity }) {
    const svgRef = useRef<Object3D>(null!)
    // const lineRef = useRef<any>(null!)

    const entry = entityModels[EntityType.Rocket]
    const size = scale(entry.size, entry.scale)

    useFrame(() => {
        const interpolation = props.entity.getSafe<InterpolationComponent>(AddonComponents.Interpolation)

        const positionAnchored = changeAnchor(
            { x: 0, y: 0 },
            interpolation.rotation,
            size,
            { x: 0.5, y: 0.5 },
            entry.anchor
        )

        console.log(`x${positionAnchored.x}, y${positionAnchored.y}`)

        svgRef.current.position.set(positionAnchored.x, positionAnchored.y, 0)
        svgRef.current.rotation.set(0, 0, interpolation.rotation)

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
            <Svg
                ref={svgRef}
                src={entry.src}
                scale={entry.scale} />
            {/*
            <line ref={lineRef}>
                <bufferGeometry />
                <lineBasicMaterial color={"#00ff00"} linewidth={10} />
            </line>
            */}
        </Suspense>
    )
}
