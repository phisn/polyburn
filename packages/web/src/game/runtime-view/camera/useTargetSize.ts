import { useThree } from "@react-three/fiber"
import { useEffect, useState } from "react"

export function useTargetSize(
    cameraBounds: {
        topLeft: { x: number; y: number }
        bottomRight: { x: number; y: number }
    },
    zoom: number,
) {
    const { size, rotation } = useSizeWithRotation()
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
        rotation,
    }
}

export function useSizeWithRotation() {
    const [rotation, setRotation] = useState(0)
    const size = useThree(state => state.size)

    useEffect(() => {
        const listener = () => {
            switch (screen.orientation.type) {
                case "landscape-primary":
                    setRotation(0)
                    break
                case "landscape-secondary":
                    setRotation(180)
                    break
                case "portrait-primary":
                    setRotation(90)
                    break
                case "portrait-secondary":
                    setRotation(270)
                    break
            }
        }

        screen.orientation.addEventListener("change", listener)

        return () => {
            screen.orientation.removeEventListener("change", listener)
        }
    })

    if (rotation == 0 || rotation == 180) {
        return {
            size,
            rotation,
        }
    }

    return {
        size: {
            width: size.height,
            height: size.width,
        },
        rotation,
    }
}
