import { Components } from "runtime/src/core/Components"
import { ShapeComponent } from "runtime/src/core/shape/ShapeComponent"
import * as THREE from "three"

import { Entity } from "../../../../../runtime-framework/src"

export function ShapeGraphic(props: { entity: Entity }) {
    const shape = props.entity.getSafe<ShapeComponent>(Components.Shape)

    const threeShape = new THREE.Shape(
        shape.vertices.map(vertex => new THREE.Vector2(vertex.x, vertex.y))
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
