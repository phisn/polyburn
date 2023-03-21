import { EntityType } from "../../../model/world/EntityType"
import { moveCameraSideTo } from "../../../model/world/Flag"
import { moveCamera } from "../../editor-store/MutationsForWorld"
import { useEditorStore } from "../../editor-store/useEditorStore"
import { isInsideCanvas, PointerHandlerParams } from "../../event/EventDefinitions"
import { MoveCameraAction } from "../state/Action"

function moveCameraActionHandler(params: PointerHandlerParams<MoveCameraAction>) {
    const state = useEditorStore.getState()

    if (params.event.leftButton) {
        state.setModeState({ 
            hint: null,
            action: {
                ...params.action,
                point: params.point
            }
        })
    }
    else {
        if (isInsideCanvas(params.event, params.canvas)) {
            const entity = state.world.entities[params.action.entityIndex]

            if (entity.type !== EntityType.RedFlag) {
                throw new Error(`Entity ${params.action.entityIndex} is not a flag`)
            }
            
            const { cameraTopLeft, cameraBottomRight } = moveCameraSideTo(
                params.action.point,
                params.action.side,
                entity
            )

            console.log(`before: ${entity.cameraTopLeft.x}, ${entity.cameraTopLeft.y}, ${entity.cameraBottomRight.x}, ${entity.cameraBottomRight.y}`)
            console.log(`after: ${cameraTopLeft.x}, ${cameraTopLeft.y}, ${cameraBottomRight.x}, ${cameraBottomRight.y}`)

            state.mutate(
                moveCamera(
                    params.action.entityIndex,
                    cameraTopLeft,
                    cameraBottomRight
                )
            )
        }

        state.setModeState({
            action: undefined
        })
    }
}

export default moveCameraActionHandler
