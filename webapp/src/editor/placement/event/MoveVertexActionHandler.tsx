import { useEditorStore } from "../../editor-store/useEditorStore"
import { moveVertex } from "../../world/World"
import { MoveVertexAction } from "../state/Action"
import { isInsideCanvas, isLeftButton, PointerHandlerParams } from "./EventListener"

export function moveVertexActionHandler(params: PointerHandlerParams<MoveVertexAction>) {
    const state = useEditorStore.getState()

    if (isLeftButton(params.event)) {
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
            state.mutate(moveVertex(
                params.action.shapeIndex,
                params.action.vertexIndex,
                params.point
            ))
        }

        state.setModeState({
            action: undefined
        })
    }
}