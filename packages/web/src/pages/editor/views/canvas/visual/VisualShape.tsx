import { Entity } from "koota"
import { useQuery, useTrait, useTraitEffect } from "koota/react"
import { useRef } from "react"
import { Mesh, MeshBasicMaterial } from "three"
import {
    baseZoom,
    highlightColor,
    selectHightlightColor,
    selectObjectColor,
} from "../../../constants"
import {
    BehaviorShape,
    BehaviorTransform,
    Highlighted,
    Selected,
    Shape,
} from "../../../store/world"
import { MutatableShapeGeometry } from "./MutatableShapeGeometry"

export function VisualShapes() {
    const rockets = useQuery(Shape)

    return (
        <>
            {rockets.map(rocket => (
                <VisualShape key={rocket.id()} entity={rocket} />
            ))}
        </>
    )
}

function VisualShape(props: { entity: Entity }) {
    const meshRef = useRef<Mesh>(null)
    const geometryRef = useRef<MutatableShapeGeometry>(undefined!)

    if (geometryRef.current === undefined) {
        geometryRef.current = new MutatableShapeGeometry()

        const shape = props.entity.get(BehaviorShape)

        if (shape) {
            geometryRef.current.update(shape.vertices)
        }
    }

    useTraitEffect(props.entity, BehaviorTransform, transform => {
        if (transform === undefined) {
            return
        }

        meshRef.current?.position.set(transform.point.x, transform.point.y, 0)
        meshRef.current?.rotation.set(0, 0, transform.rotation)
    })

    useTraitEffect(props.entity, BehaviorShape, shape => {
        if (shape === undefined) {
            return
        }

        geometryRef.current.update(shape.vertices)
    })

    const material = new MeshBasicMaterial({ color: "#ffffff" })

    const highlighted = useTrait(props.entity, Highlighted)
    const selected = useTrait(props.entity, Selected)

    if (highlighted && selected) {
        material.color.set(selectHightlightColor)
    } else if (highlighted) {
        material.color.set(highlightColor)
    } else if (selected) {
        material.color.set(selectObjectColor)
    } else {
        material.color.set("#ffffff")
    }

    const transform = props.entity.get(BehaviorTransform)

    return (
        <>
            {highlighted?.point && (
                <>
                    <mesh position={[highlighted.point.x, highlighted.point.y, 1]}>
                        <circleGeometry args={[0.016 * baseZoom]} />
                        <meshBasicMaterial color={highlighted.point.color} />
                    </mesh>
                    <mesh position={[highlighted.point.x, highlighted.point.y, 0.5]}>
                        <circleGeometry args={[0.018 * baseZoom]} />
                        <meshBasicMaterial color={"#000000"} />
                    </mesh>
                </>
            )}
            <mesh
                position={[transform?.point.x ?? 0, transform?.point.y ?? 0, 0]}
                ref={meshRef}
                geometry={geometryRef.current}
                material={material}
            />
        </>
    )
}
