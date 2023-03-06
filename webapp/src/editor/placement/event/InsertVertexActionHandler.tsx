import { useEditorStore } from "../../editor-store/useEditorStore"
import { insertVertex } from "../../world/World"
import { InsertVertexAction } from "../state/Action"
import { isInsideCanvas, isLeftButton, PointerHandlerParams } from "./Definitions"

export function insertActionHandler(params: PointerHandlerParams<InsertVertexAction>) {
    const state = useEditorStore.getState()

    if (isLeftButton(params)) {
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
            state.mutate(insertVertex(
                params.action.shapeIndex,
                params.action.vertexAfterIndex,
                params.action.point
            ))
        }

        state.setModeState({
            action: undefined
        })
    }
}