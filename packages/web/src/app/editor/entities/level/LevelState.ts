import { EntityType } from "runtime/src/core/common/EntityType"
import { Point } from "runtime/src/model/world/Point"
import { BaseEntityState } from "../../store/BaseEntityState"
import { CameraSide } from "./CameraSide"

export interface LevelState extends BaseEntityState {
    type: EntityType.Level

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

    for (const [key, line] of Object.entries(lines)) {
        const distance = distanceFromPointToLine(point, line)
        if (distance < closestDistance) {
            closestLine = key as CameraSide
            closestDistance = distance
        }
    }

    return closestLine
}

export function distanceFromPointToLine(point: { x: number; y: number }, line: [number, number][]) {
    return 0
}

export function cameraLinesFromLevel(state: LevelState) {
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
