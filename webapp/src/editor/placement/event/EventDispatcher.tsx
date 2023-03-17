
import { useEditorStore } from "../../editor-store/useEditorStore"
import useEventListener from "../../event/useEventListener"
import { ActionType } from "../state/Action"
import { PlacementState } from "../state/PlacementModeState"
import { defaultActionHandler } from "./DefaultActionHandler"
import { insertActionHandler } from "./InsertVertexActionHandler"
import { moveVertexActionHandler } from "./MoveVertexActionHandler"
import { placeEntityActionHandler } from "./PlaceEntityActionHandler"

function EventDispatcher() {
    useEventListener(params => {
        const state = useEditorStore.getState()
        let action = state.getModeStateAs<PlacementState>().action

        switch (action?.type) {
        case ActionType.InsertVertex:
            insertActionHandler({
                ...params,
                action
            })

            break
        case ActionType.MoveVertex:
            moveVertexActionHandler({
                ...params,
                action
            })

            break
                    
        case ActionType.PlaceEntityInFuture:
            action = {
                type: ActionType.PlaceEntity,
                entity: {
                    position: params.point,
                    rotation: 0,
                    type: action.entityType,
                }
            },

            state.setModeState({
                action,
            })

            // fallthrough
        case ActionType.PlaceEntity:
            placeEntityActionHandler({
                ...params,
                action
            })

            break
        default:
            defaultActionHandler(params)

            break

        }
    })

    return (
        <>
        </>
    )
}

export default EventDispatcher
