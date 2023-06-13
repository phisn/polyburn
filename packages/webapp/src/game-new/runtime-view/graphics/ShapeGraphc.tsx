import * as THREE from "three"

import { Entity } from "../../../../../runtime-framework/src"
import { WebappComponents } from "../webapp-runtime/WebappComponents"

export function ShapeGraphic(props: { entity: Entity<WebappComponents> }) {
    if (!props.entity.has("shape")) {
        throw new Error("Got invalid entity graphic type shape")
    }

    const threeShape = new THREE.Shape(
        props.entity.components.shape.vertices.map(vertex => new THREE.Vector2(vertex.x, vertex.y))
    )

    console.log("stuff")

    return (
        <>
            <mesh>
                <shapeGeometry args={[threeShape]} />
                <meshBasicMaterial color={"#DC5249"} />
            </mesh>
        </>
    )
}
