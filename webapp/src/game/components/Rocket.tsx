import { Svg } from "@react-three/drei"
import { Suspense, useRef } from "react"
import { Object3D } from "three"

import { entities } from "../../model/world/Entities"
import { EntityType } from "../../model/world/EntityType"
import { Point } from "../../model/world/Point"
import { scale } from "../../model/world/Size"
import { changeAnchor } from "../../utility/math"
import { SimulationRocket } from "../simulation/createRocketBody"
import { useInterpolation } from "./useInterpolation"

export function Rocket(props: { rocket: SimulationRocket }) {
    const svgRef = useRef<Object3D>(null!)
    // const lineRef = useRef<any>(null!)

    const entry = entities[EntityType.Rocket]
    const size = scale(entry.size, entry.scale)

    useInterpolation(props.rocket.body, (point: Point, rotation: number) => {
        const positionAnchored = changeAnchor(
            point,
            rotation,
            size,
            { x: 0.5, y: 0.5 },
            entry.anchor
        )

        svgRef.current.position.set(positionAnchored.x, positionAnchored.y, 0)
        svgRef.current.rotation.set(0, 0, rotation)

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
