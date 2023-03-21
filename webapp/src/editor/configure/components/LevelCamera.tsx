import { Line } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import { Line2 } from "three-stdlib"

import { FlagEntity } from "../../../model/world/Flag"
import { useEditorStore } from "../../editor-store/useEditorStore"
import { ActionType } from "../state/Action"
import { ConfigureHint, HintType } from "../state/Hint"

function LevelCamera(props: { entity: FlagEntity }) {
    const corners = {
        topLeft: [
            props.entity.cameraTopLeft.x,
            props.entity.cameraTopLeft.y, 1
        ] as [number, number, number],
        topRight: [
            props.entity.cameraBottomRight.x,
            props.entity.cameraTopLeft.y, 1
        ] as [number, number, number],
        bottomRight: [
            props.entity.cameraBottomRight.x,
            props.entity.cameraBottomRight.y, 1
        ] as [number, number, number],
        bottomLeft: [
            props.entity.cameraTopLeft.x,
            props.entity.cameraBottomRight.y, 1
        ] as [number, number, number],
    }

    const lines = {
        top:    [ corners.topLeft, corners.topRight ],
        right:  [ corners.topRight, corners.bottomRight ],
        bottom: [ corners.bottomRight, corners.bottomLeft ],
        left:   [ corners.bottomLeft, corners.topLeft ],
    }

    const sideHighlighted = useRef<string | undefined>()

    // refresh after state change
    sideHighlighted.current = undefined

    const lineRef = useRef<Line2>(null!)
    const highlightLineRef = useRef<Line2>(null!)

    useFrame(() => {
        const action = useEditorStore.getState().modeState.action

        if (action?.type === ActionType.MoveCamera) {
            const line = lines[action.side].flat()

            if (action.side === "top" || action.side === "bottom") {
                line[1] = action.point.y
                line[4] = action.point.y
            }
            else {
                line[0] = action.point.x
                line[3] = action.point.x
            }

            highlightLineRef.current.geometry.setPositions(line)
            return
        }

        const hint = useEditorStore.getState().modeState.hint as ConfigureHint | null

        const side = hint?.type === HintType.FlagCamera
            ? hint.side : undefined

        if (side !== sideHighlighted.current) {
            sideHighlighted.current = side

            const points = side === undefined
                ? [ 0, 0, 0 ]
                : lines[side].flat()

            highlightLineRef.current.geometry.setPositions(points)
        }
    })

    return (
        <>
            <Line
                ref={lineRef}
                points={[ 
                    ...lines.top,
                    ...lines.right,
                    ...lines.bottom,
                    ...lines.left,
                ]}
                color="orange"
                lineWidth={3}
            />

            <Line
                ref={highlightLineRef}
                points={[ 0, 0, 1, 0, 0, 1 ]}
                color="red"
                lineWidth={3}
            />
        </>
    )
}

export default LevelCamera
