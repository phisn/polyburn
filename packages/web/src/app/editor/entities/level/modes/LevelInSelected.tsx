import { Svg } from "@react-three/drei"
import { Suspense, useRef, useState } from "react"
import { EntityType } from "runtime/src/core/common/EntityType"
import { FlagEntityModel } from "runtime/src/model/world/FlagEntityModel"
import { Euler, Object3D } from "three"
import {
    entityGraphicRegistry,
    isPointInsideEntity,
} from "../../../../../game/runtime-view/graphics/EntityGraphicRegistry"
import { ConsumeEvent, Priority, useEventListener } from "../../../store/EventStore"
import { EntityContextMenu } from "../../common-components/GroupContextMenu"
import { LevelMode } from "../Level"
import { LevelState } from "../LevelState"

export interface LevelModeSelected {
    type: "selected"
}

export function LevelInSelected(props: {
    state: LevelState
    mode: LevelModeSelected
    setMode: (mode: LevelMode) => void
}) {
    const graphicEntry = entityGraphicRegistry["Green Flag"]
    const svgRef = useRef<Object3D>()

    const [showLevelDialog, setShowLevelDialog] = useState<{ x: number; y: number } | undefined>()

    useEventListener(event => {
        if (showLevelDialog && (event.leftButtonClicked || event.rightButtonClicked)) {
            setShowLevelDialog(undefined)
        }

        if (event.consumed) {
            if (event.leftButtonClicked || event.rightButtonClicked) {
                props.setMode({ type: "none" })
            }

            return
        }

        const flag: FlagEntityModel = {
            type: EntityType.Level,

            position: props.state.position,
            rotation: props.state.rotation,

            cameraTopLeft: { x: 0, y: 0 },
            cameraBottomRight: { x: 0, y: 0 },

            captureLeft: 0,
            captureRight: 0,
        }

        const isInside = isPointInsideEntity(event.position, flag)

        if (isInside) {
            if (event.rightButtonClicked) {
                setShowLevelDialog({
                    x: event.position.x + 0.1,
                    y: event.position.y - 0.1,
                })
            } else if (event.shiftKey) {
                if (event.leftButtonClicked) {
                    document.body.style.cursor = "grabbing"

                    props.setMode({
                        type: "moving",
                        offsetPosition: {
                            x: props.state.position.x - event.positionInGrid.x,
                            y: props.state.position.y - event.positionInGrid.y,
                        },
                        previousMode: { type: "selected" },
                    })
                } else {
                    document.body.style.cursor = "grab"
                }
            }

            return ConsumeEvent
        } else {
            if (event.leftButtonClicked || event.rightButtonClicked) {
                props.setMode({ type: "none" })
            }
        }
    }, Priority.Selected)

    return (
        <>
            <Suspense>
                <Svg
                    ref={svgRef as any}
                    position={[props.state.position.x, props.state.position.y, 0]}
                    rotation={new Euler(0, 0, props.state.rotation)}
                    src={graphicEntry.src}
                    scale={graphicEntry.scale}
                />
            </Suspense>

            {showLevelDialog && (
                <EntityContextMenu state={props.state} position={showLevelDialog} />
            )}
        </>
    )
}

/*
const sides: ("top" | "right" | "bottom" | "left")[] = 
        [ "top", "right", "bottom", "left" ]
        
    const [lineProps, setLineProps] = useState<LineProps>({ z: 1, color: "orange" })

    const corners = {
        topLeft: [
            props.entity.cameraTopLeft.x,
            props.entity.cameraTopLeft.y, lineProps.z
        ] as [number, number, number],
        topRight: [
            props.entity.cameraBottomRight.x,
            props.entity.cameraTopLeft.y, lineProps.z
        ] as [number, number, number],
        bottomRight: [
            props.entity.cameraBottomRight.x,
            props.entity.cameraBottomRight.y, lineProps.z
        ] as [number, number, number],
        bottomLeft: [
            props.entity.cameraTopLeft.x,
            props.entity.cameraBottomRight.y, lineProps.z
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
        const state = useEditorStore.getState().getModeStateAs<ConfigureState>()

        const { z, color: newLineColor } = getLineProps(
            props.index,
            state.selected,
            state.hint,
        )

        if (newLineColor !== lineProps.color || z !== lineProps.z) {
            setLineProps({ z, color: newLineColor })
        }

        const action = state.action

        if (action?.type === ActionType.MoveCamera && action.entityIndex == props.index) {
            const line = lines[action.side].flat()

            line[2] = z
            line[5] = z

            if (!wasInActionRef.current) {
                wasInActionRef.current = true

                linesRef[action.side].current.visible = false

                dashedLineRef.current.visible = true
                dashedLineRef.current.geometry.setPositions(
                    line
                )
                dashedLineRef.current.computeLineDistances()
            }

            if (action.side === "top" || action.side === "bottom") {
                line[1] = action.point.y
                line[4] = action.point.y

                if (action.side === "bottom") {
                    linesRef.left.current.geometry.setPositions([
                        corners.topLeft[0],
                        corners.topLeft[1], z,
                        corners.topLeft[0], 
                        action.point.y, z
                    ])

                    linesRef.right.current.geometry.setPositions([
                        corners.topRight[0],
                        corners.topRight[1], z,
                        corners.topRight[0],
                        action.point.y, z
                    ])
                }
                else {
                    linesRef.left.current.geometry.setPositions([
                        corners.bottomLeft[0],
                        action.point.y, z,
                        corners.bottomLeft[0],
                        corners.bottomLeft[1], z
                    ])

                    linesRef.right.current.geometry.setPositions([
                        corners.bottomRight[0],
                        action.point.y, z,
                        corners.bottomRight[0],
                        corners.bottomRight[1], z
                    ])
                }
            }
            else {
                line[0] = action.point.x
                line[3] = action.point.x

                if (action.side === "left") {
                    linesRef.top.current.geometry.setPositions([
                        action.point.x,
                        corners.topRight[1], z,
                        corners.topRight[0],
                        corners.topRight[1], z
                    ])

                    linesRef.bottom.current.geometry.setPositions([
                        action.point.x,
                        corners.bottomRight[1], z,
                        corners.bottomRight[0],
                        corners.bottomRight[1], z
                    ])
                }
                else {
                    linesRef.top.current.geometry.setPositions([
                        corners.topLeft[0],
                        corners.topLeft[1], z,
                        action.point.x,
                        corners.topLeft[1], z
                    ])

                    linesRef.bottom.current.geometry.setPositions([
                        corners.bottomLeft[0],
                        corners.bottomLeft[1], z,
                        action.point.x,
                        corners.bottomLeft[1], z
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
                    
                    const line = lines[side].flat()

                    line[2] = z
                    line[5] = z

                    linesRef[side].current.geometry.setPositions(line)
                })
            }

            const hint = useEditorStore.getState().getModeStateAs<ConfigureState>().hint

            const side = hint?.type === HintType.FlagCamera && hint.entityIndex === props.index
                ? hint.side : undefined

            if (side !== sideHighlighted.current) {
                sideHighlighted.current = side

                const points = side === undefined
                    ? [ 0, 0, 0 ]
                    : lines[side].flat()

                points[2] = z
                points[5] = z

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
                        color={lineProps.color}
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
                color={lineProps.color}
                lineWidth={3}
                dashed
            />
        </>
    )
    */
