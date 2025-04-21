import { Line } from "@react-three/drei"
import { Point, Rect } from "game/src/model/utils"
import { Immutable } from "immer"
import { forwardRef, Fragment, useImperativeHandle, useMemo, useRef } from "react"
import { Line2 } from "three-stdlib"
import { EditorEntityWith } from "../../../store/world"
import { BoundsSide, boundsSides, linesFromBounds } from "../event/util-bounds"

export interface VisualLevelLinesRef {
    setLineTo(side: BoundsSide, position: Point): void
    setBounds(bounds: Rect): void
    setPosition(point: Point): void
}

export const VisualLevelLines = forwardRef(function LevelCameraLines(
    props: {
        entity: Immutable<EditorEntityWith<"bounds" | "transform">>
        color: string
        colorCustom?: { [key in string]: string }
        priority: number
        dashed?: boolean
        alwaysShowDashed?: BoundsSide
    },
    ref: React.Ref<VisualLevelLinesRef>,
) {
    const lines = linesFromBounds(props.entity)

    const top = useRef<Line2>(null!)
    const right = useRef<Line2>(null!)
    const bottom = useRef<Line2>(null!)
    const left = useRef<Line2>(null!)

    const linesRef = useMemo(
        () => ({
            top,
            right,
            bottom,
            left,
        }),
        [],
    )

    useImperativeHandle(
        ref,
        () => ({
            setLineTo(side, position) {
                let {
                    top: [[tx1, ty1], [tx2, ty2]],
                    right: [[rx1, ry1], [rx2, ry2]],
                    bottom: [[bx1, by1], [bx2, by2]],
                    left: [[lx1, ly1], [lx2, ly2]],
                } = lines

                switch (side) {
                    case "top":
                        ty1 = position.y
                        ty2 = position.y

                        ly2 = position.y
                        ry1 = position.y

                        break
                    case "right":
                        rx1 = position.x
                        rx2 = position.x

                        tx2 = position.x
                        bx1 = position.x

                        break
                    case "bottom":
                        by1 = position.y
                        by2 = position.y

                        ly1 = position.y
                        ry2 = position.y

                        break
                    case "left":
                        lx1 = position.x
                        lx2 = position.x

                        tx1 = position.x
                        bx2 = position.x

                        break
                }

                linesRef["top"].current.geometry.setPositions([
                    tx1,
                    ty1,
                    props.priority,
                    tx2,
                    ty2,
                    props.priority,
                ])

                linesRef["right"].current.geometry.setPositions([
                    rx1,
                    ry1,
                    props.priority,
                    rx2,
                    ry2,
                    props.priority,
                ])

                linesRef["bottom"].current.geometry.setPositions([
                    bx1,
                    by1,
                    props.priority,
                    bx2,
                    by2,
                    props.priority,
                ])

                linesRef["left"].current.geometry.setPositions([
                    lx1,
                    ly1,
                    props.priority,
                    lx2,
                    ly2,
                    props.priority,
                ])

                linesRef[side].current.geometry.attributes.position.needsUpdate = true
            },
            setBounds(bounds) {
                const lines = linesFromBounds({ ...props.entity, bounds })

                boundsSides.forEach(side => {
                    const [[p1x, p1y], [p2x, p2y]] = lines[side]
                    const lineRef = linesRef[side].current

                    lineRef.geometry.setPositions([
                        p1x,
                        p1y,
                        props.priority,
                        p2x,
                        p2y,
                        props.priority,
                    ])
                    lineRef.geometry.attributes.position.needsUpdate = true
                })
            },
            setPosition(point) {
                const lines = linesFromBounds({
                    ...props.entity,
                    transform: { ...props.entity.transform, point },
                })

                boundsSides.forEach(side => {
                    const [[p1x, p1y], [p2x, p2y]] = lines[side]
                    const lineRef = linesRef[side].current

                    lineRef.geometry.setPositions([
                        p1x,
                        p1y,
                        props.priority,
                        p2x,
                        p2y,
                        props.priority,
                    ])
                    lineRef.geometry.attributes.position.needsUpdate = true
                })
            },
        }),
        [lines, props.priority, linesRef, props.entity],
    )

    return (
        <>
            {boundsSides.map(side => (
                <Fragment key={side}>
                    <Line
                        ref={linesRef[side]}
                        points={lines[side].map(([p1, p2]) => [p1, p2, props.priority])}
                        color={props.colorCustom?.[side] || props.color}
                        dashed={props.dashed}
                        lineWidth={3}
                    />
                </Fragment>
            ))}

            {props.alwaysShowDashed && (
                <Line
                    points={lines[props.alwaysShowDashed].map(([p1, p2]) => [
                        p1,
                        p2,
                        props.priority - 0.001,
                    ])}
                    color={props.color}
                    dashed
                    lineWidth={3}
                />
            )}
        </>
    )
})
