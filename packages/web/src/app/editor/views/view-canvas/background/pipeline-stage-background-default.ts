import { Vector3 } from "three"
import { ConsumeEvent } from "../pipeline/pipeline-event"
import { PipelineStage } from "../pipeline/pipeline-stage"

export const pipelineStageBackgroundDefault: PipelineStage = (event, { store, state, three }) => {
    store.highlight()

    if (event.leftButtonClicked) {
        state.ref = {
            type: "moving-camera",

            offsetPosition: {
                x: three.camera.position.x + event.positionInWindow.x / three.camera.zoom,
                y: three.camera.position.y - event.positionInWindow.y / three.camera.zoom,
            },

            startPosition: {
                x: three.camera.position.x,
                y: three.camera.position.y,
            },
        }

        return ConsumeEvent
    }

    if (
        (event.scroll < 0 && three.camera.zoom < 80) ||
        (event.scroll > 0 && three.camera.zoom > 2)
    ) {
        const zoom = 2 ** (Math.log2(store.zoomTarget) - event.scroll / 400)

        store.setZoomTarget(zoom, {
            inWorld: new Vector3(event.position.x, event.position.y, 0),
            inWindow: { ...event.positionInWindow },
        })
    }
}
