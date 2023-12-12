import { ConsumeEvent } from "../pipeline/pipeline-event"
import { PipelineStage } from "../pipeline/pipeline-stage"

export const pipelineStageBackgroundMoving: PipelineStage = (event, { three, state, store }) => {
    if (state.ref.type !== "moving-camera") {
        return
    }

    if (event.leftButtonDown) {
        three.camera.position.set(
            state.ref.offsetPosition.x - event.positionInWindow.x / three.camera.zoom,
            state.ref.offsetPosition.y + event.positionInWindow.y / three.camera.zoom,
            three.camera.position.z,
        )

        three.camera.zoom = store.zoomTarget
        three.camera.updateProjectionMatrix()
    } else {
        if (
            state.ref.startPosition.x === three.camera.position.x &&
            state.ref.startPosition.y === three.camera.position.y
        ) {
            store.deselect()
        }

        state.ref = { type: "none" }
    }

    return ConsumeEvent
}
