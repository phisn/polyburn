import { Svg } from "@react-three/drei"
import { Suspense, useRef, useState } from "react"
import { Euler, MeshBasicMaterial, Object3D } from "three"
import { entityGraphicRegistry } from "../../../../game/runtime-view/graphics-assets/entity-graphic-registry"
import { EntityGraphicType } from "../../../../game/runtime-view/graphics-assets/entity-graphic-type"
import { useComponentEventListener } from "../../modules/store/use-component-event-listener"
import { RocketEntity } from "./rocket-entity"

export function RocketGraphic(props: { entity: RocketEntity }) {
    const [hover, setHover] = useState(false)

    const svgRef = useRef<Object3D>(null)
    const svgFillMaterial = useRef<MeshBasicMaterial>(new MeshBasicMaterial({ color: 0x000000 }))

    const graphicEntry = entityGraphicRegistry[EntityGraphicType.Rocket]

    useComponentEventListener(event => {
        switch (event.type) {
            case "object-move":
                if (event.entity.id === props.entity.id) {
                    svgRef.current!.position.set(
                        event.entity.object.position.x,
                        event.entity.object.position.y,
                        0,
                    )
                }
                break
            case "object-hover":
                if (event.entity.id === props.entity.id) {
                }
                break
        }
    })

    return (
        <Suspense>
            <Svg
                ref={svgRef as any}
                position={[props.entity.object.position.x, props.entity.object.position.y, 0]}
                rotation={new Euler(0, 0, props.entity.object.rotation)}
                src={graphicEntry.src}
                scale={graphicEntry.scale}
                fillMaterial={svgFillMaterial.current}
            />
        </Suspense>
    )
}
