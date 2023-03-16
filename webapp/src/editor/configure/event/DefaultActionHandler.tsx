import { isPointInsideShape } from "../../../model/world/Shape"
import { useEditorStore } from "../../editor-store/useEditorStore"
import { PointerHandlerParams } from "../../event/EventDefinitions"
import { HintType } from "../state/Hint"

function defaultActionHandler(params: PointerHandlerParams) {
    const state = useEditorStore.getState()

    for (let i = 0; i < state.world.shapes.length; i++) {
        const shape = state.world.shapes[i]

        if (isPointInsideShape(params.point, shape)) {
            console.log("inside shape")
            state.setModeState({
                hint: {
                    type: HintType.Shape,
                    shapeIndex: i,
                }
            })

            return
        }
    }

    state.setModeState({
        hint: null
    })
}

export default defaultActionHandler
