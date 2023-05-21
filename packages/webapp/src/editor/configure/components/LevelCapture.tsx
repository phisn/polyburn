import { Box } from "@react-three/drei"
import { Euler } from "three"

import { changeAnchor } from "../../../common/math"
import { captureBox, flagCaptureHeight, FlagEntity } from "../../../model/world/FlagModel"

function LevelCapture(props: { entity: FlagEntity, index: number }) {
    const { size, transformed } = captureBox(props.entity)

    const center = changeAnchor(
        transformed,
        props.entity.rotation,
        size,
        { x: 0.5, y: 0 },
        { x: 0.5, y: 0.5 }
    )

    return (
        <>
            <Box
                rotation={new Euler(0, 0, props.entity.rotation)}
                position={[center.x, center.y, 0]}
                args={[
                    props.entity.captureLeft + props.entity.captureRight,
                    flagCaptureHeight
                ]}>

                <meshBasicMaterial transparent color="#00ff00" opacity={0.2} />
            </Box>
        </>
    )
}

export default LevelCapture
