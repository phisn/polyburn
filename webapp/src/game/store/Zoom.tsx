
export const ZoomIndexToZoom = [ 1, 1.5, 2, 3, 4 ]

export function canZoomIn(index: number) {
    return index < ZoomIndexToZoom.length - 1
}

export function canZoomOut(index: number) {
    return index > 0
}
