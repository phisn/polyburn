import { Line } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useState } from "react"

import { FlagEntity } from "../../../model/world/FlagModel"
import { useEditorStore } from "../../store/useEditorStore"
import { HintType } from "../state/Hint"
import { PlacementState } from "../state/PlacementModeState"

export function LevelCamera(props: { entity: FlagEntity, index: number }) {
    // stroke only rectangle defined by
    // props.entity.cameraBottomRight
    // props.entity.cameraTopLeft

    const [color, setColor] = useState("orange")

    useFrame(() => {
        const hint = useEditorStore.getState().getModeStateAs<PlacementState>().hint

        if (hint?.type === HintType.Entity && hint.entityIndex === props.index) {
            setColor("purple")
        }
        else {
            setColor("orange")
        }
    })

    return (
        <>
            <Line
                points={[
                    [
                        props.entity.cameraTopLeft.x, 
                        props.entity.cameraTopLeft.y, 0
                    ],
                    [
                        props.entity.cameraBottomRight.x, 
                        props.entity.cameraTopLeft.y, 0
                    ],
                    [
                        props.entity.cameraBottomRight.x, 
                        props.entity.cameraBottomRight.y, 0
                    ], 
                    [
                        props.entity.cameraTopLeft.x, 
                        props.entity.cameraBottomRight.y, 0
                    ],
                    [
                        props.entity.cameraTopLeft.x, 
                        props.entity.cameraTopLeft.y, 0
                    ],
                ]}
                color={color}
                lineWidth={3}
                dashed
            />
        </>
    )
}
