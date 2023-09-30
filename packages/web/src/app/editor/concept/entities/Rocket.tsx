import { Svg } from "@react-three/drei"
import { Ref, Suspense, forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import { EntityWith } from "runtime-framework"
import { Point } from "runtime/src/model/point"
import { Euler, MeshBasicMaterial, Object3D } from "three"
import { entityGraphicRegistry } from "../../../../game/runtime-view/graphics-assets/entity-graphic-registry"
import { EntityGraphicType } from "../../../../game/runtime-view/graphics-assets/entity-graphic-type"
import { isPointInsideEntity } from "../../models/is-point-inside-entity"
import { EditorComponents } from "../editor-framework-base"
import { ObjectVisuals } from "../features/object/object"
import { EntityPriority } from "./entity-priority"
import { useEntityAccessor } from "./use-entity-accessor"

type RocketRef = ObjectVisuals

export const Rocket = forwardRef(function Rocket(
    props: {
        entity: EntityWith<EditorComponents, "object">
    },
    ref: Ref<RocketRef>,
) {
    const object = props.entity.components.object
    const graphicEntry = entityGraphicRegistry[EntityGraphicType.Rocket]

    const svgRef = useRef<Object3D>()
    const colorRef = useRef<MeshBasicMaterial>(new MeshBasicMaterial())

    useEffect(() => {
        colorRef.current.color.set(0xffffff)
    })

    useEntityAccessor(props.entity, () => ({
        drawHovered: (hovered: boolean) => {
            colorRef.current.color.set(hovered ? 0x5555ff : 0xffffff)
        },
        drawPosition: (position: Point) => {
            svgRef.current?.position.set(position.x, position.y, EntityPriority.Rocket)
        },
        drawRotation: (rotation: number) => {
            svgRef.current?.rotation.set(0, 0, rotation)
        },
    }))

    useImperativeHandle(
        ref,
        () => ({
            setHovered: (hovered: boolean) => {
                colorRef.current.color.set(hovered ? 0x5555ff : 0xffffff)
            },
            setPosition: (position: Point) => {
                svgRef.current?.position.set(position.x, position.y, EntityPriority.Rocket)
            },
            setRotation: (rotation: number) => {
                svgRef.current?.rotation.set(0, 0, rotation)
            },
            isInside: (position: Point): boolean => {
                return isPointInsideEntity(
                    position,
                    { x: object.position().x, y: object.position().y },
                    object.rotation(),
                    EntityGraphicType.Rocket,
                )
            },
        }),
        [object],
    )

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
})
