import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from "three"
import { MeshBasicMaterial } from "three"

import { shapeColor, shapeColorSelected } from "../../../common/Values"
import { useEditorStore } from "../../editor-store/useEditorStore"
import { ConfigureState } from "../state/ConfigureModeState"
import { ConfigureHint, HintType } from "../state/Hint"

export function Shape(props: { shapeIndex: number }) {
    const shape = useEditorStore(state => state.world.shapes[props.shapeIndex])
    
    const threeShape = new THREE.Shape(
        shape.vertices.map(vertex => new THREE.Vector2(vertex.x, vertex.y))
    )
    
    const materialRef = useRef<MeshBasicMaterial>(null!)
    const previousStrokeColor = useRef<string>()

    useFrame(() => {
        const hint = useEditorStore.getState().getModeStateAs<ConfigureState>().hint
        const newStrokeColor = getStrokeColor(props.shapeIndex, hint)

        if (newStrokeColor !== previousStrokeColor.current) {
            materialRef.current.color.set(newStrokeColor)
            previousStrokeColor.current = newStrokeColor
        }
    })

    return (
        <>
            <mesh>
                <shapeGeometry args={[threeShape]} />
                <meshBasicMaterial ref={materialRef} />
            </mesh>
        </>
    )
}

function getStrokeColor(index: number, hint: ConfigureHint | null) {
    if (hint && hint.type === HintType.Shape) {
        if (hint.shapeIndex === index) {
            return shapeColorSelected
        }
    }

    return shapeColor
}
