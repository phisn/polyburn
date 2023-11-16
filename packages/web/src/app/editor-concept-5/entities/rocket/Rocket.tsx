import { Svg } from "@react-three/drei"
import { Suspense, useMemo, useRef } from "react"
import { EntityType } from "runtime/proto/world"
import { Point } from "runtime/src/model/point"
import { Euler, MeshBasicMaterial } from "three"
import { entityGraphicRegistry } from "../../../../game/runtime-view/graphics-assets/entity-graphic-registry"
import { EntityGraphicType } from "../../../../game/runtime-view/graphics-assets/entity-graphic-type"
import { resolveEntityOrder } from "../resolve-entity-order"

export function Rocket(props: { entity: RocketEntity }) {
    const svgRef = useRef<Object3D>(null)
    const graphicEntry = entityGraphicRegistry[EntityGraphicType.Rocket]

    const setPosition = useMemo((position: Point, rotation: number) => {
        svgRef.current?.position.set(position.x, position.y, resolveEntityOrder({ inAction: true }))
    }, [])

    return (
        <ObjectBehavior isInside={isInside} setPosition={setPosition}>
            {state => (
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
