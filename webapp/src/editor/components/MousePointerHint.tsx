import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import { Mesh, MeshBasicMaterial } from "three"

import { useEditorStore } from "../editor-store/useEditorStore"
import { HintType, PlacementHint } from "../placement/state/Hint"
import { baseZoomFactor, highlightColor, highlightDeleteColor, highlightVertexColor, mousePointerhintLayer } from "../Values"

function GetVisualHintParams(hint: PlacementHint) {
    switch (hint.type) {
    case HintType.Vertex:
        return {
            color: hint.delete ? highlightDeleteColor : highlightVertexColor,
            point: hint.point
        }
    
    case HintType.Edge:
        return {
            color: highlightColor,
            point: hint.point
        }
        
    default:
        return null
    }
}

export function MousePointerHint() {
    const materialRef = useRef<MeshBasicMaterial>(null!)
    const meshRef = useRef<Mesh>(null!)

    useFrame(() => {
        const hint = useEditorStore.getState().modeState.hint
        
        const params = hint && GetVisualHintParams(hint)

        if (params) {
            materialRef.current.color.set(params.color)
            meshRef.current.visible = true
            meshRef.current.position.set(params.point.x, params.point.y, mousePointerhintLayer)
        }
        else {
            meshRef.current.visible = false
        }
    })

    return (
        <>
            <mesh ref={meshRef}>
                <circleGeometry args={[5.0 * baseZoomFactor]} />
                <meshBasicMaterial ref={materialRef} />
            </mesh>
        </>
    )
}
