import RAPIER from "@dimforge/rapier2d-compat"
import { Svg } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Suspense, useRef } from "react"
import { Object3D } from "three"

import { entities } from "../../model/world/Entities"
import { EntityType } from "../../model/world/Entity"
import { scale } from "../../model/world/Size"
import { changeAnchor } from "../../utility/math"

export function Rocket(props: { body: RAPIER.RigidBody }) {
    const svgRef = useRef<Object3D>(null!)
    
    const entry = entities[EntityType.Rocket]
    const size = scale(entry.size, entry.scale)

    useFrame(() => {
        if (props.body.isSleeping() === false) {
            const position = props.body.translation()

            const newRotation = props.body.rotation() + Math.PI

            const newPosition = changeAnchor(
                position,
                newRotation,
                size,
                { x: 0.5, y: 0.5 },
                entry.anchor
            )
            
            svgRef.current.position.set(
                newPosition.x,
                newPosition.y,
                0
            )

            svgRef.current.rotation.set(
                0, 
                0, 
                newRotation
            )
        }
    })

    return (
        <Suspense>
            <Svg
                ref={svgRef}
                src={entry.src}
                scale={entry.scale} />
        </Suspense>
    )
}
