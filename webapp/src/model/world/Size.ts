export interface Size {
    width: number
    height: number
}

export function scale(size: Size, scale: number) {
    return {
        width: size.width * scale,
        height: size.height * scale,
    }
}
