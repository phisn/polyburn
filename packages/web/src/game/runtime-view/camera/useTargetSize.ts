import { useThree } from "@react-three/fiber"
import { updateSizeByOrientation } from "./updateSizeByOrientation"

export function useTargetSize(
    cameraBounds: {
        topLeft: { x: number; y: number }
        bottomRight: { x: number; y: number }
    },
    zoom: number,
) {
    const { size, sizeRotated } = updateSizeByOrientation(useThree(state => state.size))

    const aspect = size.width / size.height

    const cameraSize = {
        x: (cameraBounds.bottomRight.x - cameraBounds.topLeft.x) / zoom,
        y: (cameraBounds.topLeft.y - cameraBounds.bottomRight.y) / zoom,
    }

    let targetSize

    if (aspect > cameraSize.x / cameraSize.y) {
        targetSize = {
            x: cameraSize.x,
            y: (cameraSize.x / size.width) * size.height,
        }
    } else {
        targetSize = {
            x: (cameraSize.y / size.height) * size.width,
            y: cameraSize.y,
        }
    }

    return {
        targetSize,
        sizeRotated,
    }
}
