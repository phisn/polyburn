import { Svg } from "@react-three/drei"
import { Suspense, useRef } from "react"
import { EntityType } from "runtime/proto/world"
import { Euler, MeshBasicMaterial, Object3D } from "three"
import { entityGraphicRegistry } from "../../../../game/runtime-view/graphics-assets/entity-graphic-registry"
import { EntityGraphicType } from "../../../../game/runtime-view/graphics-assets/entity-graphic-type"
import { resolveEntityOrder } from "../resolve-entity-order"
import { RocketEntity } from "./rocket-entity"

export function RocketGraphic(props: { entity: RocketEntity }) {
    const svgRef = useRef<Object3D>(null)
    const graphicEntry = entityGraphicRegistry[EntityGraphicType.Rocket]

    const setPosition = useMemo((position: Point, rotation: number) => {
        svgRef.current?.position.set(position.x, position.y, resolveEntityOrder({ inAction: true }))
    }, [])

    return (
        <ObjectBehavior setPosition={setPosition}>
            {state => (
                <Suspense>
                    <Svg
                        ref={svgRef as any}
                        position={[
                            props.entity.position.x,
                            props.entity.position.y,
                            resolveEntityOrder({
                                entityType: EntityType.ROCKET,
                                hovered,
                                selected: false,
                            }),
                        ]}
                        rotation={new Euler(0, 0, props.entity.rotation)}
                        src={graphicEntry.src}
                        scale={graphicEntry.scale}
                        fillMaterial={
                            state.type === "hovered"
                                ? new MeshBasicMaterial({ color: "#ffff55" })
                                : undefined
                        }
                    />
                </Suspense>
            )}
        </ObjectBehavior>
    )
}
