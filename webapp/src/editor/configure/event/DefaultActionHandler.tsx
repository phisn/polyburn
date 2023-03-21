import { EntityType } from "../../../model/world/EntityType"
import { pointCloseToCameraSide } from "../../../model/world/Flag"
import { Point } from "../../../model/world/Point"
import { isPointInsideShape } from "../../../model/world/Shape"
import { EditorStore } from "../../editor-store/EditorStore"
import { useEditorStore } from "../../editor-store/useEditorStore"
import { isInsideCanvas, PointerHandlerParams } from "../../event/EventDefinitions"
import { ActionType } from "../state/Action"
import { ConfigureState } from "../state/ConfigureModeState"
import { HintType } from "../state/Hint"

function defaultActionHandler(params: PointerHandlerParams) {
    const state = useEditorStore.getState()

    updateHint(params.point, state)

    if (params.event.leftButton && !params.previousEvent?.leftButton && 
        isInsideCanvas(params.event, params.canvas)) {

        const state = useEditorStore.getState()
        const modeState = state.getModeStateAs<ConfigureState>()

        switch (modeState.hint?.type) {
        case HintType.FlagCamera:
            state.setModeState({
                action: {
                    type: ActionType.MoveCamera,

                    side: modeState.hint.side,
                    entityIndex: modeState.hint.entityIndex,
                    point: params.point
                },
                hint: null
            })

            break
        }
    }
}

function updateHint(point: Point, state: EditorStore) {
    for (let i = 0; i < state.world.entities.length; i++) {
        const entity = state.world.entities[i]

        if (entity.type !== EntityType.RedFlag) {
            continue
        }

        const side = pointCloseToCameraSide(point, entity)

        if (side) {
            state.setModeState({
                hint: {
                    type: HintType.FlagCamera,
                    side,
                    entityIndex: i
                }
            })

            return
        }
    }

    for (let i = 0; i < state.world.shapes.length; i++) {
        const shape = state.world.shapes[i]

        if (isPointInsideShape(point, shape)) {
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
