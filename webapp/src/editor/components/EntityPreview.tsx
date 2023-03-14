import { Svg } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Suspense, useRef, useState } from "react"
import { Object3D } from "three"

import { entities } from "../../model/world/Entities"
import { EntityType } from "../../model/world/Entity"
import { useEditorStore } from "../editor-store/useEditorStore"
import { ActionType } from "../placement/state/Action"

export function EntityPreview() {
    const [entityType, setEntityType] = useState<EntityType | null>(null)
    const entry = entityType && entities[entityType]

    const svgRef = useRef<Object3D>(null)

    useFrame(() => {
        const action = useEditorStore.getState().modeState.action

        if (action?.type == ActionType.PlaceEntity) {
            if (action.entity.type != entityType) {
                setEntityType(action.entity.type)
            }

            if (svgRef.current) {
                svgRef.current.position.set(
                    action.entity.position.x,
                    action.entity.position.y,
                    0
                )
                
                svgRef.current.rotation.set(0, 0, action.entity.rotation)
            }
        }
        else {
            setEntityType(null)
        }
    })

    return (
        <>
            { entry &&
                <Suspense fallback={null}>
                    <Svg
                        ref={svgRef}
                        src={entry.src}
                        scale={entry.scale} />
                </Suspense>
            }
        </>
    )
}