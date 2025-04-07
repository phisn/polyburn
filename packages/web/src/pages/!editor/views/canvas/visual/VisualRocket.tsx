import { Svg } from "@react-three/drei"
import { Entity } from "koota"
import { useQuery, useTrait, useTraitEffect } from "koota/react"
import { useRef } from "react"
import { MeshBasicMaterial, Object3D } from "three"
import { entityGraphicRegistry } from "../../../../_editor/graphics-assets/entity-graphic-registry"
import { EntityGraphicType } from "../../../../_editor/graphics-assets/entity-graphic-type"
import { highlightColor, selectHightlightColor, selectObjectColor } from "../../../constants"
import { BehaviorTransform, Highlighted, Rocket, Selected } from "../../../store/world"

export function VisualRockets() {
    const rockets = useQuery(Rocket)

    return (
        <>
            {rockets.map(rocket => (
                <VisualRocket key={rocket.id()} entity={rocket} />
            ))}
        </>
    )
}

function VisualRocket(props: { entity: Entity }) {
    const meshRef = useRef<Object3D>(null)

    useTraitEffect(props.entity, BehaviorTransform, transform => {
        if (transform === undefined) {
            return
        }

        console.log(transform)

        meshRef.current?.position.set(transform.point.x, transform.point.y, 0)
        meshRef.current?.rotation.set(0, 0, transform.rotation)
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
        <object3D position={[-0.5 * graphicEntry.size.width, 0.5 * graphicEntry.size.height, 0]}>
            <Svg
                position={[transform?.point.x ?? 0, transform?.point.y ?? 0, 0]}
                rotation={[0, 0, transform?.rotation ?? 0]}
                fillMaterial={material}
                ref={meshRef}
                src={graphicEntry.src}
                scale={graphicEntry.scale}
            />
        </object3D>
    )
}

const graphicEntry = entityGraphicRegistry[EntityGraphicType.Rocket]
