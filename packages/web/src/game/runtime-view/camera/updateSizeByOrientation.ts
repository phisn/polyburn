import { isMobile } from "react-device-detect"

export function updateSizeByOrientation(size: { width: number; height: number }) {
    if (isMobile && size.width < size.height) {
        return {
            size: {
                width: size.height,
                height: size.width,
            },
            rotation: true,
        }
    }

    return {
        size,
        rotation: 0,
    }
}
