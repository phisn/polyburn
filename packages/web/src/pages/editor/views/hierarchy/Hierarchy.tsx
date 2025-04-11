import { Immutable } from "immer"
import { ChevronDown } from "../../../../components/common/svg/ChevronDown"
import { FlagSvg } from "../../../../components/common/svg/Flag"
import { LayersSvg } from "../../../../components/common/svg/Layers"
import { MapSvg } from "../../../../components/common/svg/Map"
import { MapFilledSvg } from "../../../../components/common/svg/MapFilled"
import { Plus } from "../../../../components/common/svg/PlusLg"
import { RocketSvg } from "../../../../components/common/svg/Rocket"
import { TriangleSvg } from "../../../../components/common/svg/Triangle"
import { useEditorStore } from "../../store/store"
import { EditorEntity, EditorGamemode } from "../../store/world"
import { EditorContainer } from "../EditorContainer"

export function Hierarchy() {
    const world = useEditorStore(x => x.world)

    return (
        <EditorContainer>
            <div className="pb-6 pt-4">
                <div className="flex items-center justify-between space-x-2 px-6 py-2 text-gray-400">
                    <div>Gamemodes</div>
                    <div className="btn btn-square btn-ghost btn-sm">
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
                <div className="divider" />
                <HierarchyGroups />
            </div>
        </EditorContainer>
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

function HierarchyGroups() {
    const world = useEditorStore(x => x.world)
    const gamemodeSelected = useEditorStore(x => x.selectedGamemode)

    function filterEntity(entity: Immutable<EditorEntity>) {
        if (entity.group === undefined) {
        }

        if (gamemodeSelected) {
        }
    }

    const groups = gamemodeSelected ? world.gamemodes[gamemodeSelected].groups : undefined

    return (
        <>
            <div className="flex items-center justify-between space-x-2 px-6 py-2 text-gray-400">
                <div>Groups</div>
                <div className="btn btn-square btn-ghost btn-sm">
                    <Plus width="16" height="16" />
                </div>
            </div>
            <div>
                <EntryGroup>Shapes</EntryGroup>
                <div className="flex">
                    <div className="divider divider-horizontal" />
                    <div>
                        <div className="flex items-center space-x-2 py-1">
                            <TriangleSvg width="16" height="16" />
                            <div>Shape</div>
                        </div>
                        <div className="flex items-center space-x-2 py-1">
                            <TriangleSvg width="16" height="16" />
                            <div>Shape</div>
                        </div>
                        <div className="flex items-center space-x-2 py-1">
                            <TriangleSvg width="16" height="16" />
                            <div>Shape</div>
                        </div>
                    </div>
                </div>
                <EntryGroup>Reverse</EntryGroup>
                <div className="flex">
                    <div className="divider divider-horizontal" />
                    <div>
                        <div className="flex items-center space-x-2 py-1">
                            <FlagSvg width="16" height="16" />
                            <div>Flag</div>
                        </div>
                        <div className="flex items-center space-x-2 py-1">
                            <FlagSvg width="16" height="16" />
                            <div>Flag</div>
                        </div>
                        <div className="flex items-center space-x-2 py-1">
                            <RocketSvg width="16" height="16" />
                            <div>Rocket</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

function EntryGroup(props: {
    children: React.ReactNode
    empty?: boolean
    opened?: boolean
    className?: string
}) {
    return (
        <div
            className={
                "hover:bg-base-200 text-primary flex items-center space-x-2 px-6 py-2 transition hover:cursor-pointer  "
            }
        >
            {props.opened && <ChevronDown width="16" height="16" />}

            <LayersSvg width="16" height="16" />

            <div className={"flex-grow " + props.className}>{props.children}</div>
        </div>
    )
}

function EntryEntity(props: { entitiy: EditorEntity }) {}
