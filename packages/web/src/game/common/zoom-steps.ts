export const canZoomIn = (zoomIndex: number) => zoomIndex < ZoomSteps.length - 1
export const canZoomOut = (zoomIndex: number) => zoomIndex > 0

export const ZoomSteps = [1, 1.5, 2, 3, 4]

/*
zoomIn: () => {
    const zoomIndex = get().zoomIndex
    if (zoomIndex < ZoomSteps.length - 1) {
        set({
            zoomIndex: zoomIndex + 1,
            zoom: ZoomSteps[zoomIndex + 1],
        })
    }
},
zoomOut: () => {
    const zoomIndex = get().zoomIndex
    if (ZoomSteps.length > 0) {
        set({
            zoomIndex: zoomIndex - 1,
            zoom: ZoomSteps[zoomIndex - 1],
        })
    }
},
*/
