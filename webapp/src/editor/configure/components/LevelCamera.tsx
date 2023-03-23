import { Line } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import { Line2 } from "three-stdlib"

import { FlagEntity } from "../../../model/world/Flag"
import { useEditorStore } from "../../editor-store/useEditorStore"
import { ActionType } from "../state/Action"
import { ConfigureHint, HintType } from "../state/Hint"

function LevelCamera(props: { entity: FlagEntity, index: number }) {
    const sides: ("top" | "right" | "bottom" | "left")[] = 
        [ "top", "right", "bottom", "left" ]

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

    const linesRef = {
        top: useRef<Line2>(null!),
        right: useRef<Line2>(null!),
        bottom: useRef<Line2>(null!),
        left: useRef<Line2>(null!),
    }

    const highlightLineRef = useRef<Line2>(null!)
    const dashedLineRef = useRef<Line2>(null!)

    const wasInActionRef = useRef(false)

    useFrame(() => {
        const action = useEditorStore.getState().modeState.action

        if (action?.type === ActionType.MoveCamera && action.entityIndex == props.index) {
            const line = lines[action.side].flat()

            if (!wasInActionRef.current) {
                wasInActionRef.current = true

                linesRef[action.side].current.visible = false

                dashedLineRef.current.visible = true
                dashedLineRef.current.geometry.setPositions(
                    lines[action.side].flat()
                )
                dashedLineRef.current.computeLineDistances()
            }

            if (action.side === "top" || action.side === "bottom") {
                line[1] = action.point.y
                line[4] = action.point.y

                if (action.side === "bottom") {
                    linesRef.left.current.geometry.setPositions([
                        ...corners.topLeft,
                        corners.topLeft[0], 
                        action.point.y, 1
                    ])

                    linesRef.right.current.geometry.setPositions([
                        ...corners.topRight,
                        corners.topRight[0],
                        action.point.y, 1
                    ])
                }
                else {
                    linesRef.left.current.geometry.setPositions([
                        corners.bottomLeft[0],
                        action.point.y, 1,
                        ...corners.bottomLeft
                    ])

                    linesRef.right.current.geometry.setPositions([
                        corners.bottomRight[0],
                        action.point.y, 1,
                        ...corners.bottomRight
                    ])
                }
            }
            else {
                line[0] = action.point.x
                line[3] = action.point.x

                if (action.side === "left") {
                    linesRef.top.current.geometry.setPositions([
                        action.point.x,
                        corners.topRight[1], 1,
                        ...corners.topRight
                    ])

                    linesRef.bottom.current.geometry.setPositions([
                        action.point.x,
                        corners.bottomRight[1], 1,
                        ...corners.bottomRight
                    ])
                }
                else {
                    linesRef.top.current.geometry.setPositions([
                        ...corners.topLeft,
                        action.point.x,
                        corners.topLeft[1], 1
                    ])

                    linesRef.bottom.current.geometry.setPositions([
                        ...corners.bottomLeft,
                        action.point.x,
                        corners.bottomLeft[1], 1
                    ])
                }
            }

            highlightLineRef.current.geometry.setPositions(line)
        }
        else {
            if (wasInActionRef.current) {
                wasInActionRef.current = false

                dashedLineRef.current.visible = false

                sides.forEach(side => {
                    linesRef[side].current.visible = true
                    linesRef[side].current.geometry.setPositions(
                        lines[side].flat()
                    )
                })
            }

            const hint = useEditorStore.getState().modeState.hint as ConfigureHint | null

            const side = hint?.type === HintType.FlagCamera && hint.entityIndex === props.index
                ? hint.side : undefined

            if (side !== sideHighlighted.current) {
                sideHighlighted.current = side

                const points = side === undefined
                    ? [ 0, 0, 0 ]
                    : lines[side].flat()

                highlightLineRef.current.geometry.setPositions(points)
            }
        }
    })

    return (
        <>
            {
                sides.map(side =>
                    <Line
                        key={side}
                        ref={linesRef[side]}
                        points={lines[side]}
                        color="orange"
                        lineWidth={3}
                    />
                )
            }

            <Line
                ref={highlightLineRef}
                points={[ 0, 0, 1, 0, 0, 1 ]}
                color="red"
                lineWidth={3}
            />

            <Line
                ref={dashedLineRef}
                points={[ 0, 0, 1, 0, 0, 1 ]}
                color="orange"
                lineWidth={3}
                dashed
            />
        </>
    )
}

export default LevelCamera
