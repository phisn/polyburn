import { useRef } from "react"
import { EntityWith } from "runtime-framework"
import * as THREE from "three"
import { MutatableShapeGeometry } from "../../../app/editor/entities/shape/MutatableShapeGeometry"
import { WebappComponents } from "../../runtime-extension/webapp-components"
import { withEntityStore } from "./WithEntityStore"

export function ShapeGraphic(props: { entity: EntityWith<WebappComponents, "shape"> }) {
    if (!props.entity.has("shape")) {
        throw new Error("Got invalid entity graphic type")
    }

    const geometryRef = useRef(
        new MutatableShapeGeometry(
            props.entity.components.shape.vertices.map(vertex => ({
                position: new THREE.Vector2(vertex.position.x, vertex.position.y),
                color: vertex.color,
            })),
        ),
    )

    return (
        <>
            <mesh frustumCulled={false} geometry={geometryRef.current}>
                <meshBasicMaterial vertexColors />
            </mesh>
        </>
    )
}

export const ShapeGraphics = withEntityStore(ShapeGraphic, "shape")
