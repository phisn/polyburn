import { Svg } from "@react-three/drei"
import { Suspense, useRef } from "react"
import { EntityType } from "runtime/proto/world"
import { Euler, MeshBasicMaterial } from "three"
import { entityGraphicRegistry } from "../../../../game/runtime-view/graphics-assets/entity-graphic-registry"
import { EntityGraphicType } from "../../../../game/runtime-view/graphics-assets/entity-graphic-type"
import { isPointInsideEntity } from "../../../editor/models/is-point-inside-entity"
import { resolveEntityOrder } from "../resolve-entity-order"

export function Rocket(props: { entity: RocketEntity }) {
    const svgRef = useRef<Object3D>(null)
    const graphicEntry = entityGraphicRegistry[EntityGraphicType.Rocket]

    const { hovered } = useObjectBehavior({
        isInside: point =>
            isPointInsideEntity(
                point,
                props.entity.position,
                props.entity.rotation,
                EntityGraphicType.Rocket,
            ),
        setPosition: (position, rotation) => {
            svgRef.current!.position.set(
                position.x,
                position.y,
                resolveEntityOrder({ inAction: true }),
            )
            svgRef.current!.rotation.set(0, 0, rotation)
        },
    })

    return (
        <Suspense>
            <Svg
                ref={svgRef as any}
                position={[
                    props.state.position.x,
                    props.state.position.y,
                    resolveEntityOrder({
                        entityType: EntityType.ROCKET,
                        hovered,
                        selected: false,
                    }),
                ]}
                rotation={new Euler(0, 0, props.state.rotation)}
                src={graphicEntry.src}
                scale={graphicEntry.scale}
                fillMaterial={hovered ? new MeshBasicMaterial({ color: "#ffff55" }) : undefined}
            />
        </Suspense>
    )
}
