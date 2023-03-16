import { useEditorStore } from "../../editor-store/useEditorStore"
import useEventListener from "../../event/useEventListener"
import { ConfigureState } from "../state/ConfigureModeState"
import defaultActionHandler from "./DefaultActionHandler"

function EventDispatcher() {
    useEventListener(params => {
        const state = useEditorStore.getState()
        const action = state.getModeStateAs<ConfigureState>().action

        switch (action) {
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
