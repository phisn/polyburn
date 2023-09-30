import { Svg } from "@react-three/drei"
import { Suspense, useEffect, useRef } from "react"
import { EntityWith } from "runtime-framework"
import { Point } from "runtime/src/model/point"
import { Euler, MeshBasicMaterial, Object3D } from "three"
import { withEntityStore } from "../../../../common/runtime-framework/WithEntityStore"
import { entityGraphicRegistry } from "../../../../game/runtime-view/graphics-assets/entity-graphic-registry"
import { EntityGraphicType } from "../../../../game/runtime-view/graphics-assets/entity-graphic-type"
import { EditorComponents } from "../editor-framework-base"
import { EntityPriority } from "./entity-priority"
import { useEntityGraphicsProvider } from "./use-entity-graphics-provider"

export function Rocket(props: { entity: EntityWith<EditorComponents, "object"> }) {
    const object = props.entity.components.object
    const graphicEntry = entityGraphicRegistry[EntityGraphicType.Rocket]

    const svgRef = useRef<Object3D>()
    const colorRef = useRef<MeshBasicMaterial>(new MeshBasicMaterial())

    useEffect(() => {
        colorRef.current.color.set(0xffffff)
    })

    useEntityGraphicsProvider(props.entity, () => ({
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
                position={[object.position().x, object.position().y, EntityPriority.Rocket]}
                rotation={new Euler(0, 0, object.rotation())}
                src={graphicEntry.src}
                scale={graphicEntry.scale}
                fillMaterial={colorRef.current}
            />
        </Suspense>
    )
}

export const RocketGraphics = withEntityStore(Rocket, "object")
