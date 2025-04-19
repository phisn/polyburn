import { Immutable } from "immer"
import { MapSvg } from "../../../../components/common/svg/Map"
import { MapFilledSvg } from "../../../../components/common/svg/MapFilled"
import { Plus } from "../../../../components/common/svg/PlusLg"
import { useEditorStore } from "../../store/store"
import { EditorGamemode } from "../../store/world"

export function HierarchyGamemodes() {
    const world = useEditorStore(x => x.world)

    return (
        <>
            <div className="flex items-center justify-between space-x-2 px-6 py-2 text-gray-400">
                <div>Gamemodes</div>
                <div className="btn btn-square btn-ghost btn-sm hover:bg-base-200">
                    <Plus width="16" height="16" />
                </div>
            </div>
            <div>
                {Object.keys(world.gamemodes).map(key => (
                    <HierarchyGamemode
                        key={key}
                        gamemode={world.gamemodes[key]}
                        gamemodeName={key}
                    />
                ))}
            </div>
        </>
    )
}

function HierarchyGamemode(props: { gamemode: Immutable<EditorGamemode>; gamemodeName: string }) {
    const selected = useEditorStore(x => x.selectedGamemode === props.gamemodeName)
    const selectGamemode = useEditorStore(x => x.selectGamemode)

    function onClick() {
        if (selected) {
            selectGamemode()
        } else {
            selectGamemode(props.gamemodeName)
        }
    }

    return (
        <div
            onClick={onClick}
            className={
                "flex items-center space-x-2 px-6 py-2 transition hover:cursor-pointer " +
                (selected ? "bg-primary hover:bg-base-100 text-black" : "hover:bg-base-200")
            }
        >
            {selected && <MapFilledSvg width="16" height="16" />}
            {!selected && <MapSvg width="16" height="16" />}

            <div>{props.gamemodeName}</div>
        </div>
    )
}
