
export const ZoomsIndexed = [ 1, 1.5, 2, 3, 4 ]

export interface Zoom {
    index: number
    value: number
}

export function canZoomIn(index: number) {
    return index < ZoomsIndexed.length - 1
}

export function canZoomOut(index: number) {
    return index > 0
}
