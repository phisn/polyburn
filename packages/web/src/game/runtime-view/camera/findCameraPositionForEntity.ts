import { Point } from "runtime/src/model/Point"

export function findCameraTargetPosition(
    basePosition: Point,
    targetSize: Point,
    cameraBounds: { topLeft: Point; bottomRight: Point },
) {
    const targetPosition = { x: basePosition.x, y: basePosition.y }

    if (targetPosition.x < cameraBounds.topLeft.x + targetSize.x / 2) {
        targetPosition.x = cameraBounds.topLeft.x + targetSize.x / 2
    }

    if (targetPosition.x > cameraBounds.bottomRight.x - targetSize.x / 2) {
        targetPosition.x = cameraBounds.bottomRight.x - targetSize.x / 2
    }

    if (targetPosition.y > cameraBounds.topLeft.y - targetSize.y / 2) {
        targetPosition.y = cameraBounds.topLeft.y - targetSize.y / 2
    }

    if (targetPosition.y < cameraBounds.bottomRight.y + targetSize.y / 2) {
        targetPosition.y = cameraBounds.bottomRight.y + targetSize.y / 2
    }

    return targetPosition
}
