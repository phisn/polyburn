import { Svg } from "@react-three/drei"
import { Entity } from "koota"
import { useQuery, useTraitEffect } from "koota/react"
import { useRef } from "react"
import { MeshBasicMaterial, Object3D } from "three"
import { entityGraphicRegistry } from "../../../../_editor/graphics-assets/entity-graphic-registry"
import { EntityGraphicType } from "../../../../_editor/graphics-assets/entity-graphic-type"
import { highlightColor, selectHightlightColor, selectObjectColor } from "../../../constants"
import { BehaviorTransform, Highlighted, Rocket, Selected } from "../../../store/world"

export function VisualRocket() {
    const rockets = useQuery(Rocket)

    return (
        <>
            {rockets.map(rocket => (
                <VisualRocketSingle key={rocket.id()} entity={rocket} />
            ))}
        </>
    )
}

function VisualRocketSingle(props: { entity: Entity }) {
    const meshRef = useRef<Object3D>(null)
    const materialRef = useRef(new MeshBasicMaterial())

    useTraitEffect(props.entity, BehaviorTransform, transform => {
        if (transform === undefined) {
            return
        }

        meshRef.current?.position.set(transform.point.x, transform.point.y, 0)
        meshRef.current?.rotation.set(0, 0, transform.rotation)
    })

    const onFocusChange = () => {
        const highlighted = props.entity.has(Highlighted)
        const selected = props.entity.has(Selected)

        if (highlighted && selected) {
            materialRef.current.color.set(selectHightlightColor)
        } else if (highlighted) {
            materialRef.current.color.set(highlightColor)
        } else if (selected) {
            materialRef.current.color.set(selectObjectColor)
        } else {
            materialRef.current.color.set("#ffffff")
        }
    }

    useTraitEffect(props.entity, Highlighted, onFocusChange)
    useTraitEffect(props.entity, Selected, onFocusChange)

    const transform = props.entity.get(BehaviorTransform)

    return (
        <Svg
            position={[transform?.point.x ?? 0, transform?.point.y ?? 0, 0]}
            rotation={[0, 0, transform?.rotation ?? 0]}
            fillMaterial={materialRef.current}
            ref={meshRef}
            src={graphicEntry.src}
            scale={graphicEntry.scale}
        />
    )
}

const graphicEntry = entityGraphicRegistry[EntityGraphicType.Rocket]
