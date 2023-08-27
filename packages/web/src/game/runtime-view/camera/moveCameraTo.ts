import { moveSourceTo } from "./moveSourceTo"

export function moveCameraTo(
    distance: number,
    size: { width: number; height: number },
    cameraTargetSize: { x: number; y: number },
) {
    const widthDiff = Math.abs(cameraTargetSize.x - size.width)
    const heightDiff = Math.abs(cameraTargetSize.y - size.height)

    if (widthDiff > heightDiff) {
        const approx = moveSourceTo(distance, size.width, cameraTargetSize.x)

        return {
            newWidth: approx.result,
            newHeight: (approx.result / size.width) * size.height,
            overflow: approx.overflow,
        }
    } else {
        const approx = moveSourceTo(distance, size.height, cameraTargetSize.y)

        return {
            newWidth: (approx.result / size.height) * size.width,
            newHeight: approx.result,
            overflow: approx.overflow,
        }
    }
}
