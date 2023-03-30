import { isPointInsideEntity } from "../../../model/world/Entities"
import { EntityType } from "../../../model/world/EntityType"
import { pointCloseToCameraSide } from "../../../model/world/Flag"
import { Point } from "../../../model/world/Point"
import { isPointInsideShape } from "../../../model/world/Shape"
import { isInsideCanvas, PointerHandlerParams } from "../../event/EventDefinitions"
import { EditorStore } from "../../store/EditorStore"
import { useEditorStore } from "../../store/useEditorStore"
import { ActionType } from "../state/Action"
import { ConfigureState } from "../state/ConfigureModeState"
import { HintType } from "../state/Hint"
import { SelectableType } from "../state/Selectable"

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
        case HintType.Selectable:
            state.setModeState({
                selected: modeState.hint.selectable
            })

            break
        case HintType.Space:
            console.log("space")

            state.setModeState({
                selected: null
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

    for (let i = state.world.entities.length - 1; i >= 0; i--) {
        const entity = state.world.entities[i]

        if (isPointInsideEntity(point, entity)) {
            state.setModeState({
                hint: {
                    type: HintType.Selectable,
                    selectable: {
                        type: SelectableType.Entity,
                        entityIndex: i
                    }
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
                    type: HintType.Selectable,
                    selectable: {
                        type: SelectableType.Shape,
                        shapeIndex: i
                    }
                }
            })

            return
        }
    }

    state.setModeState({
        hint: {
            type: HintType.Space
        }
    })
}

export default defaultActionHandler
