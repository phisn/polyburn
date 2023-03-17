import { EntityType } from "../../model/world/Entity"
import { useEditorStore } from "../editor-store/useEditorStore"
import EntityTypeSelection from "./EntityTypeSelection"
import { ActionType } from "./state/Action"
import { PlacementState } from "./state/PlacementModeState"

function SideBar() {
    const action = useEditorStore(state => state.getModeStateAs<PlacementState>().action)
    const setModeState = useEditorStore(state => state.setModeState)

    const onSelectObject = (type: EntityType | undefined) => {
        if (type) {
            setModeState({
                action: {
                    type: ActionType.PlaceEntityInFuture,
                    entityType: type
                }
            })
        }
        else {
            setModeState({
                action: null
            })
        }
    }

    const selected = action?.type === ActionType.PlaceEntityInFuture
        ? action.entityType
        : action?.type === ActionType.PlaceEntity
            ? action.entity.type
            : undefined

    return (
        <div className="absolute top-0 right-0 p-4">
            <div className="flex p-4 flex-col items-center bg-base-100 rounded-lg h-full self-end">
                <EntityTypeSelection
                    selected={selected}
                    onSelect={onSelectObject}
                />

                {/*
                <div className="fixed bottom-0 left-0 p-4 pointer-events-none select-none">
                    <div className="flex flex-col text-white opacity-50">
                        { placementHandler && <PlacementHandler state={placementHandler} /> }
                    </div>
                </div>
                */}
            </div>
        </div>
    )
}

export default SideBar
