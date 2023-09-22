import { EntityType } from "runtime/proto/world"
import { Point } from "runtime/src/model/Point"
import { snapDistance } from "../../../../common/constants"
import { EntityStateBase } from "../../models/entity-state-base"
import { CameraSide } from "./camera-side"

export interface LevelState extends EntityStateBase {
    type: EntityType.LEVEL

    position: Point
    rotation: number

    cameraTopLeft: Point
    cameraBottomRight: Point

    captureLeft: number
    captureRight: number
}

export function findCameraLineCloseTo(state: LevelState, point: Point) {
    const lines = cameraLinesFromLevel(state)

    let closestLine: CameraSide | undefined
    let closestDistance = Number.MAX_SAFE_INTEGER

    for (const [key, [p1, p2]] of Object.entries(lines)) {
        const distance = distanceToLine(point, [p1, p2])

        if (distance < closestDistance) {
            closestLine = key as CameraSide
            closestDistance = distance
        }
    }

    if (closestDistance > snapDistance) {
        return undefined
    }

    return closestLine
}

export function distanceToLine(point: { x: number; y: number }, [p1, p2]: [number, number][]) {
    const [x1, y1] = p1
    const [x2, y2] = p2

    const A = point.x - x1
    const B = point.y - y1
    const C = x2 - x1
    const D = y2 - y1

    const dot = A * C + B * D
    const len_sq = C * C + D * D
    const param = dot / len_sq

    let xx, yy

    if (param < 0 || (x1 === x2 && y1 === y2)) {
        xx = x1
        yy = y1
    } else if (param > 1) {
        xx = x2
        yy = y2
    } else {
        xx = x1 + param * C
        yy = y1 + param * D
    }

    const dx = point.x - xx
    const dy = point.y - yy

    return Math.sqrt(dx * dx + dy * dy)
}

export function cameraLinesFromLevel(state: { cameraTopLeft: Point; cameraBottomRight: Point }) {
    const corners: { [key: string]: [number, number] } = {
        topLeft: [state.cameraTopLeft.x, state.cameraTopLeft.y],
        topRight: [state.cameraBottomRight.x, state.cameraTopLeft.y],
        bottomRight: [state.cameraBottomRight.x, state.cameraBottomRight.y],
        bottomLeft: [state.cameraTopLeft.x, state.cameraBottomRight.y],
    }

    const lines = {
        top: [corners.topLeft, corners.topRight],
        right: [corners.topRight, corners.bottomRight],
        bottom: [corners.bottomRight, corners.bottomLeft],
        left: [corners.bottomLeft, corners.topLeft],
    }

    return lines
}
