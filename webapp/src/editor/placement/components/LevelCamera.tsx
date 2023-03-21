import { Line } from "@react-three/drei"

import { FlagEntity } from "../../../model/world/Entity"

export function LevelCamera(props: { entity: FlagEntity }) {
    // stroke only rectangle defined by
    // props.entity.cameraBottomRight
    // props.entity.cameraTopLeft

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
                color="orange"
                lineWidth={3}
                dashed
            />
        </>
    )
}
