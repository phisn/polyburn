import { isInsideCanvas, PointerHandlerParams } from "../../event/EventDefinitions"
import { moveVertex } from "../../store/MutationsForWorld"
import { useEditorStore } from "../../store/useEditorStore"
import { MoveVertexAction } from "../state/Action"

export function moveVertexActionHandler(params: PointerHandlerParams<MoveVertexAction>) {
    const state = useEditorStore.getState()

    if (params.event.leftButton) {
        state.setModeState({ 
            hint: null,
            action: {
                ...params.action,
                point: params.pointMaybeSnapped
            }
        })
    }
    else {
        if (isInsideCanvas(params.event, params.canvas)) {
            state.mutate(moveVertex(
                params.action.shapeIndex,
                params.action.vertexIndex,
                params.pointMaybeSnapped
            ))
        }

        state.setModeState({
            action: undefined
        })
    }
}