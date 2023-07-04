
export const ZoomSteps = [ 1, 1.5, 2, 3, 4 ]

export const canZoomIn = (zoomIndex: number) => zoomIndex < ZoomSteps.length - 1
export const canZoomOut = (zoomIndex: number) => zoomIndex > 0
