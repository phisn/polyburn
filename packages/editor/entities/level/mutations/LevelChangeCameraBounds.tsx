import { Point } from "runtime/src/model/point"
import { CameraSide } from "../camera-side"
import { LevelState } from "../level-state"

export function levelChangeCameraBounds(level: LevelState, topLeft: Point, bottomRight: Point) {
    const previousTopLeft = level.cameraTopLeft
    const previousBottomRight = level.cameraBottomRight

    return {
        do() {
            level.cameraTopLeft = topLeft
            level.cameraBottomRight = bottomRight
        },
        undo() {
            level.cameraTopLeft = previousTopLeft
            level.cameraBottomRight = previousBottomRight
        },
    }
}

export function levelChangeCameraBoundsByMouse(level: LevelState, side: CameraSide, point: Point) {
    const topLeft = { ...level.cameraTopLeft }
    const bottomRight = { ...level.cameraBottomRight }

    switch (side) {
        case "top":
            topLeft.y = point.y
            break
        case "bottom":
            bottomRight.y = point.y
            break
        case "left":
            topLeft.x = point.x
            break
        case "right":
            bottomRight.x = point.x
            break
    }

    return levelChangeCameraBounds(level, topLeft, bottomRight)
}
