import { Svg } from "@react-three/drei"
import { Immutable } from "immer"
import { useMemo, useRef } from "react"
import { MeshBasicMaterial, Object3D } from "three"
import { highlightColor, selectHightlightColor, selectObjectColor } from "../../../constants"
import { useEditorStore } from "../../../store/store"
import { useEntityEvent } from "../../../store/store-events"
import { EditorRocket } from "../../../store/world"
import { entityGraphicRegistry } from "./graphics-assets/entity-graphic-registry"
import { EntityGraphicType } from "./graphics-assets/entity-graphic-type"

export function VisualRockets() {
    const world = useEditorStore(x => x.world)

    return (
        <>
            {Object.keys(world.entities)
                .map(key => [key, world.entities[key]] as const)
                .map(
                    ([id, entity]) =>
                        entity.type === "rocket" && (
                            <VisualRocket key={id} id={id} entity={entity} />
                        ),
                )}
        </>
    )
}

function VisualRocket(props: { id: string; entity: Immutable<EditorRocket> }) {
    const meshRef = useRef<Object3D>(null)

    useEntityEvent(props.id, "transform", transform => {
        if (transform === undefined) {
            return
        }

        meshRef.current?.position.set(transform.point.x, transform.point.y, 0.1)
        meshRef.current?.rotation.set(0, 0, transform.rotation)
    })

    const highlighted = useEditorStore(x => x.highlighted.has(props.id))
    const selected = useEditorStore(x => x.selected.has(props.id))

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
        <object3D
            ref={meshRef}
            position={[
                props.entity.transform?.point.x ?? 0,
                props.entity.transform?.point.y ?? 0,
                0.1,
            ]}
            rotation={[0, 0, props.entity.transform?.rotation ?? 0]}
        >
            <Svg
                position={[-0.5 * graphicEntry.size.width, 0.5 * graphicEntry.size.height, 0]}
                fillMaterial={material}
                ref={meshRef}
                src={graphicEntry.src}
                scale={graphicEntry.scale}
            />
        </object3D>
    )
}

const graphicEntry = entityGraphicRegistry[EntityGraphicType.Rocket]
