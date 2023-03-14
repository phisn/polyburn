import { Svg } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Suspense, useState } from "react"
import { Euler, MeshBasicMaterial } from "three"

import { entities } from "../../model/world/Entities"
import { Entity as EntityModel } from "../../model/world/Entity"
import { useEditorStore } from "../editor-store/useEditorStore"
import { HintType, PlacementHint } from "../placement/state/Hint"

export function Entity(props: { entity: EntityModel, index?: number }) {
    const entry = entities[props.entity.type]

    const [material, setMaterial] = useState<MeshBasicMaterial>(
        new MeshBasicMaterial({ color: 0x000000 })
    )

    /*
    const { topLeft, topRight, bottomLeft, bottomRight } = useMemo(
        () => entityRect(props.entity), 
        [props.entity]
    )
    */

    useFrame(() => {
        const hint = useEditorStore.getState().modeState.hint
        const newStrokeColor = getStrokeColor(props.index, hint)

        if (newStrokeColor !== material.color.getHex()) {
            setMaterial(
                new MeshBasicMaterial({ color: newStrokeColor })
            )
        }
    })

    return (
        <>
            <Suspense fallback={null}>
                { props.entity.position &&
                    <Svg
                        fillMaterial={material}
                        src={entry.src}
                        scale={entry.scale} 
                        position={[
                            props.entity.position.x,
                            props.entity.position.y,
                            0 
                        ]} 
                        rotation={new Euler(0, 0, props.entity.rotation)} />                }
            </Suspense>

            {/*
            <mesh position={[topLeft.x, topLeft.y, 0.5]}>
                <circleGeometry args={[5.0]} />
                <meshBasicMaterial color="#ff0000" />
            </mesh>
            <mesh position={[topRight.x, topRight.y, 0.5]}>
                <circleGeometry args={[5.0]} />
                <meshBasicMaterial color="#55ff55" />
            </mesh>
            <mesh position={[bottomLeft.x, bottomLeft.y, 0.5]}>
                <circleGeometry args={[5.0]} />
                <meshBasicMaterial color="#5555ff" />
            </mesh>
            <mesh position={[bottomRight.x, bottomRight.y, 0.5]}>
                <circleGeometry args={[5.0]} />
                <meshBasicMaterial color="#ffff55" />
            </mesh>
            */}
        </>
    )
}
function getStrokeColor(index: number | undefined, hint: PlacementHint | null) {
    const isHighlighted = index !== undefined
        && hint?.type === HintType.Entity
        && hint.entityIndex === index

    const isToDelete = isHighlighted && hint.delete

    if (isToDelete) {
        return 0xff4444
    }

    if (isHighlighted) {
        return 0xffff44
    }

    return 0xffffff
}

