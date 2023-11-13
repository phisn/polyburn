import { ConsumeEvent } from "../pipeline/pipeline-event"
import { PipelineStage } from "../pipeline/pipeline-stage"

export const pipelineStageBackgroundDefault: PipelineStage = (event, { state, three }) => {
    if (event.leftButtonClicked) {
        state.ref = {
            type: "moving-camera",

            offsetPosition: {
                x: three.camera.position.x + event.positionInWindow.x / three.camera.zoom,
                y: three.camera.position.y - event.positionInWindow.y / three.camera.zoom,
            },
        }

        return ConsumeEvent
    }

    if (
        (event.scroll < 0 && three.camera.zoom < 80) ||
        (event.scroll > 0 && three.camera.zoom > 2)
    ) {
        three.camera.zoom = 2 ** (Math.log2(three.camera.zoom) - event.scroll / 100)
        three.camera.updateProjectionMatrix()

        const canvasCenter = {
            x: three.size.width * 0.5,
            y: three.size.height * 0.5,
        }

        three.camera.position.set(
            event.positionInWindow.x + (canvasCenter.x - event.position.x) / three.camera.zoom,
            event.positionInWindow.y - (canvasCenter.y - event.position.y) / three.camera.zoom,

            three.camera.position.z,
        )
    }
}
