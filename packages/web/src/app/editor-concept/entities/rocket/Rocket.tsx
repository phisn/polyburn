import { Svg } from "@react-three/drei"
import { Suspense, useEffect, useRef } from "react"
import { Point } from "runtime/src/model/point"
import { Euler, MeshBasicMaterial, Object3D } from "three"
import { withEntityStore } from "../../../../common/runtime-framework/WithEntityStore"
import { entityGraphicRegistry } from "../../../../game/runtime-view/graphics-assets/entity-graphic-registry"
import { EntityGraphicType } from "../../../../game/runtime-view/graphics-assets/entity-graphic-type"
import { RocketEditModel } from "../../store/edit-models/entity-edit-model"
import { EntityPriority } from "../entity-priority"
import { useGraphicsProvider } from "../use-graphics-provider"

export function Rocket(props: { entity: RocketEditModel }) {
    const graphicEntry = entityGraphicRegistry[EntityGraphicType.Rocket]

    const svgRef = useRef<Object3D>()
    const colorRef = useRef<MeshBasicMaterial>(new MeshBasicMaterial())

    useEffect(() => {
        colorRef.current.color.set(0xffffff)
    })

    useGraphicsProvider(props.entity, "object", () => ({
        hovered: (hovered: boolean) => {
            colorRef.current.color.set(hovered ? 0x5555ff : 0xffffff)
        },
        position: (position: Point) => {
            svgRef.current?.position.set(position.x, position.y, EntityPriority.Rocket)
        },
        rotation: (rotation: number) => {
            svgRef.current?.rotation.set(0, 0, rotation)
        },
    }))

    return (
        <Suspense>
            <Svg
                ref={svgRef as any}
                position={[props.entity.position.x, props.entity.position.y, EntityPriority.Rocket]}
                rotation={new Euler(0, 0, props.entity.rotation)}
                src={graphicEntry.src}
                scale={graphicEntry.scale}
                fillMaterial={colorRef.current}
            />
        </Suspense>
    )
}

export const RocketGraphics = withEntityStore(Rocket, "object")
