import { useThree } from "@react-three/fiber"
import { useRotateScreen } from "./useRotateScreen"

export function useTargetSize(
    cameraBounds: {
        topLeft: { x: number; y: number }
        bottomRight: { x: number; y: number }
    },
    zoom: number,
) {
    const { size, rotated } = useSizeWithRotation()
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
        rotated,
    }
}

export function useSizeWithRotation() {
    const rotated = useRotateScreen()
    const size = useThree(state => state.size)

    if (rotated) {
        return {
            size: {
                width: size.height,
                height: size.width,
            },
            rotated,
        }
    }

    return {
        size,
        rotated,
    }
}
