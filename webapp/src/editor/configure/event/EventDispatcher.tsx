import { useEditorStore } from "../../editor-store/useEditorStore"
import useEventListener from "../../event/useEventListener"
import { ActionType } from "../state/Action"
import { ConfigureState } from "../state/ConfigureModeState"
import defaultActionHandler from "./DefaultActionHandler"
import moveCameraActionHandler from "./MoveCameraActionHandler"

function EventDispatcher() {
    useEventListener(params => {
        const state = useEditorStore.getState()
        const action = state.getModeStateAs<ConfigureState>().action

        console.log(`action type: ${action?.type}, hint type: ${state.getModeStateAs<ConfigureState>().hint?.type}`)

        switch (action?.type) {
        case ActionType.MoveCamera:
            moveCameraActionHandler({
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
