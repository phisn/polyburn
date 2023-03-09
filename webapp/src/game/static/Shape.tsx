import * as THREE from "three"

import { Point } from "../../model/world/Point"

export interface ShapeProps {
    vertices: Point[]
}

export function Shape(props: ShapeProps) {
    console.log(`rendering shape with ${props.vertices.length} vertices`)

    const threeShape = new THREE.Shape(
        props.vertices.map(vertex => new THREE.Vector2(vertex.x, vertex.y))
    )

    return (
        <>
            <mesh>
                <shapeGeometry args={[threeShape]} />
                <meshBasicMaterial color={"#DC5249"} />
            </mesh>
        </>
    )
}