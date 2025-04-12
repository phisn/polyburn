import { useEffect, useMemo, useRef } from "react"
import { Mesh, MeshBasicMaterial } from "three"
import { highlightColor, selectHightlightColor, selectObjectColor } from "../../../constants"

import { Immutable } from "immer"
import { useEditorStore } from "../../../store/store"
import { useEntityEvent } from "../../../store/store-events"
import { EditorShape } from "../../../store/world"
import { MutatableShapeGeometry } from "./MutatableShapeGeometry"

export function VisualShape(props: { entityKey: string; entity: Immutable<EditorShape> }) {
    const meshRef = useRef<Mesh>(null)
    const geometryRef = useRef<MutatableShapeGeometry>(undefined!)

    if (geometryRef.current === undefined) {
        geometryRef.current = new MutatableShapeGeometry()
    }

    useEffect(() => {
        if (geometryRef.current) {
            geometryRef.current.update(props.entity.vertices)
        }
    }, [props.entity.vertices])

    useEntityEvent(props.entityKey, "transform", transform => {
        meshRef.current?.position.set(transform.point.x, transform.point.y, 0)
        meshRef.current?.rotation.set(0, 0, transform.rotation)
    })

    useEntityEvent(props.entityKey, "vertices", vertices => {
        geometryRef.current.update(vertices)
    })

    const highlighted = useEditorStore(x => x.highlighted.has(props.entityKey))
    const selected = useEditorStore(x => x.selected.has(props.entityKey))

    const material = useMemo(() => {
        const material = new MeshBasicMaterial({ color: "#ffffff" })

        if (highlighted && selected) {
            material.color.set(selectHightlightColor)
        } else if (highlighted) {
            material.color.set(highlightColor)
        } else if (selected) {
            material.color.set(selectObjectColor)
        } else {
            material.color.set("#ffffff")
        }

        return material
    }, [highlighted, selected])

    return (
        <mesh
            position={[props.entity.transform.point.x, props.entity.transform.point.y, 0]}
            ref={meshRef}
            geometry={geometryRef.current}
            material={material}
        />
    )
}
