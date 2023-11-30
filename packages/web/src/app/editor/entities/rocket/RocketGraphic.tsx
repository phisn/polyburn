import { Svg } from "@react-three/drei"
import { Suspense, useRef } from "react"
import { EntityType } from "runtime/proto/world"
import { Euler, MeshBasicMaterial, Object3D } from "three"
import { entityGraphicRegistry } from "../../../../game/runtime-view/graphics-assets/entity-graphic-registry"
import { EntityGraphicType } from "../../../../game/runtime-view/graphics-assets/entity-graphic-type"
import { useEventListener } from "../../store/use-event-listener"
import { useIsHighlighted } from "../../store/use-is-highlighted"
import { useIsSelected } from "../../store/use-is-selected"
import { withEntitiesFromStore } from "../WithEntitiesFromStore"
import { resolveEntityOrder } from "../resolve-entity-order"
import { ImmutableRocketEntity } from "./rocket-entity"

export function RocketGraphic(props: { entity: ImmutableRocketEntity }) {
    const svgRef = useRef<Object3D>(null)
    const graphicEntry = entityGraphicRegistry[EntityGraphicType.Rocket]

    const selected = useIsSelected(props.entity)
    const highlighted = useIsHighlighted(props.entity)

    const order = resolveEntityOrder({
        entityType: EntityType.ROCKET,
        selected,
        highlighted,
    })

    useEventListener("object-move", props.entity.id, event => {
        svgRef.current?.position.set(event.position.x, event.position.y, order)
    })

    return (
        <Suspense>
            <Svg
                ref={svgRef as any}
                position={[props.entity.object.position.x, props.entity.object.position.y, order]}
                rotation={new Euler(0, 0, props.entity.object.rotation)}
                src={graphicEntry.src}
                scale={graphicEntry.scale}
                fillMaterial={
                    highlighted
                        ? new MeshBasicMaterial({ color: "#ffff55" })
                        : selected
                        ? new MeshBasicMaterial({ color: "#ffff00" })
                        : undefined
                }
            />
        </Suspense>
    )
}

export const RocketGraphics = withEntitiesFromStore(EntityType.ROCKET, RocketGraphic)
