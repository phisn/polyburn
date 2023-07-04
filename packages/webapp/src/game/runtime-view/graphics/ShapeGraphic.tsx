import { Entity } from "runtime-framework"
import * as THREE from "three"

import { WebappComponents } from "../webapp-runtime/WebappComponents"

export function ShapeGraphic(props: { entity: Entity<WebappComponents> }) {
    if (!props.entity.has("shape")) {
        throw new Error("Got invalid entity graphic type")
    }

    const threeShape = new THREE.Shape(
        props.entity.components.shape.vertices.map(vertex => new THREE.Vector2(vertex.x, vertex.y))
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
