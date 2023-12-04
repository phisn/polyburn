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

        console.log("start moving camera")

        return ConsumeEvent
    }

    if (
        (event.scroll < 0 && three.camera.zoom < 80) ||
        (event.scroll > 0 && three.camera.zoom > 2)
    ) {
        three.camera.zoom = 2 ** (Math.log2(three.camera.zoom) - event.scroll / 400)
        three.camera.updateProjectionMatrix()

        const canvasCenter = {
            x: three.size.width * 0.5,
            y: three.size.height * 0.5,
        }

        const previousPosition = three.camera.position.clone()

        three.camera.position.set(
            event.position.x + (canvasCenter.x - event.positionInWindow.x) / three.camera.zoom,
            event.position.y - (canvasCenter.y - event.positionInWindow.y) / three.camera.zoom,

            three.camera.position.z,
        )

        console.log(
            "position",
            previousPosition.x,
            previousPosition.y,
            "=>",
            three.camera.position.x,
            three.camera.position.y,
        )
    }
}
