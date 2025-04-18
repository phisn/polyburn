import { Immutable } from "immer"
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react"
import { EyeSlashSvg } from "../../../../components/common/svg/EyeSlash"
import { FlagSvg } from "../../../../components/common/svg/Flag"
import { LayersSvg } from "../../../../components/common/svg/Layers"
import { MapSvg } from "../../../../components/common/svg/Map"
import { MapFilledSvg } from "../../../../components/common/svg/MapFilled"
import { Plus } from "../../../../components/common/svg/PlusLg"
import { RocketSvg } from "../../../../components/common/svg/Rocket"
import { TriangleSvg } from "../../../../components/common/svg/Triangle"
import { ZoomInSvg } from "../../../../components/common/svg/ZoomIn"
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

    const groupMap = Object.groupBy(
        Object.keys(world.entities).map(x => [x, world.entities[x]] as const),
        ([_, entity]) => entity.group ?? "",
    )

    const missingGroups = gamemodeSelected
        ? world.gamemodes[gamemodeSelected].groups
        : Object.entries(world.gamemodes).flatMap(x => x[1].groups)

    for (const group of missingGroups) {
        if (!(group in groupMap)) {
            groupMap[group] = []
        }
    }

    const groups = Object.entries(groupMap)
        .sort((x, y) => {
            if (x[0] === "") {
                return 1
            }

            if (y[0] === "") {
                return -1
            }

            return x[0].localeCompare(y[0])
        })
        .filter(([group, _]) => {
            if (gamemodeSelected === undefined) {
                return true
            }

            return group === "" || world.gamemodes[gamemodeSelected].groups.includes(group)
        })

    return (
        <>
            <div className="flex items-center justify-between space-x-2 px-6 py-2 text-gray-400">
                <div>Groups</div>
                {gamemodeSelected && <HierarchyGroupAdd gamemodeSelected={gamemodeSelected} />}
            </div>
            <div>
                {groups.map(([group, entities]) => (
                    <HierarchyEntryGroup key={group} group={group} entities={entities ?? []} />
                ))}
            </div>
        </>
    )
}

function HierarchyGroupAdd(props: { gamemodeSelected: string }) {
    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const world = useEditorStore(x => x.world)
    const updateWorld = useEditorStore(x => x.updateWorld)

    const buttonRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const groups = new Set([
        ...Object.values(world.entities).map(x => x.group),
        ...Object.entries(world.gamemodes).flatMap(x => x[1].groups),
    ])
        .values()
        .filter((x): x is string => x !== undefined && x !== "")
        .filter(x => x.toLowerCase().includes(searchQuery.toLowerCase()))
        .take(8)
        .toArray()

    function onGroupClicked(group: string) {
        updateWorld(world => {
            const gamemode = world.gamemodes[props.gamemodeSelected]

            if (gamemode.groups.includes(group)) {
                gamemode.groups.splice(gamemode.groups.indexOf(group), 1)
            } else {
                gamemode.groups.push(group)
            }
        })
    }

    const Entry = useMemo(
        () => (props: { checked: boolean; onClick: () => void; children: React.ReactNode }) => (
            <div
                onClick={props.onClick}
                className="hover:bg-base-200 flex items-center space-x-3 rounded-lg px-6 py-1 transition hover:cursor-pointer"
            >
                <input
                    onChange={() => void 0}
                    checked={props.checked}
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-secondary "
                />
                <div>{props.children}</div>
            </div>
        ),
        [],
    )
    useEffect(() => {
        const onClick = (event: globalThis.MouseEvent) => {
            if (
                event.target &&
                !containerRef.current?.contains(event.target as any) &&
                !buttonRef.current?.contains(event.target as any)
            ) {
                setOpen(false)
            }
        }

        if (open) {
            document.addEventListener("mousedown", onClick)
        }

        return () => {
            document.removeEventListener("mousedown", onClick)
        }
    }, [open])

    return (
        <>
            <div className="relative">
                <div
                    ref={buttonRef}
                    onClick={() => setOpen(!open)}
                    className="btn btn-square btn-ghost btn-sm hover:bg-base-200"
                >
                    <Plus width="16" height="16" />
                </div>
                {open && (
                    <div
                        ref={containerRef}
                        tabIndex={-1}
                        className="bg-base-300 border-base-200 absolute -left-4 right-0 m-2 w-screen max-w-xs rounded-2xl border p-2 py-4"
                    >
                        <div className="relative px-5">
                            <ZoomInSvg className="absolute left-7 top-2" />
                            <input
                                className="input input-sm bg-base-300 input-ghost w-full pl-9"
                                placeholder="Search groups..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="divider my-1" />
                        <div className="">
                            {groups.map(group => (
                                <Entry
                                    checked={world.gamemodes[
                                        props.gamemodeSelected
                                    ].groups.includes(group)}
                                    onClick={() => onGroupClicked(group)}
                                    key={group}
                                >
                                    {group}
                                </Entry>
                            ))}
                        </div>
                        <div className="divider my-1" />
                        <HierarchyGroupAddNewGroup gamemodeSelected={props.gamemodeSelected} />
                    </div>
                )}
            </div>
        </>
    )
}

function HierarchyGroupAddNewGroup(props: { gamemodeSelected: string }) {
    const [isWriting, setIsWriting] = useState(false)
    const [name, setName] = useState("")

    const updateWorld = useEditorStore(x => x.updateWorld)

    const containerRef = useRef<HTMLDivElement>(null)

    if (isWriting) {
        function onBlur(event: React.FocusEvent) {
            if (!containerRef.current?.contains(event.relatedTarget)) {
                setIsWriting(false)
            }
        }

        function onAdd() {
            updateWorld(x => {
                x.gamemodes[props.gamemodeSelected].groups.push(name)
            })

            setName("")
            setIsWriting(false)
        }

        return (
            <div ref={containerRef} onBlur={onBlur} className="join relative w-full px-5 py-1">
                <input
                    autoFocus
                    className="input input-sm join-item bg-base-300 input-ghost w-full"
                    placeholder="Enter group name..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            onAdd()
                        }
                    }}
                />
                <div tabIndex={-1} onClick={onAdd} className="btn join-item btn-sm">
                    <Plus width="16" height="16" />
                </div>
            </div>
        )
    } else {
        return (
            <div className="px-3">
                <div
                    onClick={() => setIsWriting(true)}
                    className="hover:bg-base-200 flex items-center space-x-2 rounded-lg px-4 py-2 transition hover:cursor-pointer"
                >
                    <Plus width="16" height="16" />
                    <div>Create new group</div>
                </div>
            </div>
        )
    }
}

function HierarchyEntryGroup(props: {
    group: string
    entities: Immutable<[string, EditorEntity]>[]
}) {
    const selected = useEditorStore(x => x.selectedGroup === props.group)
    const otherSelected = useEditorStore(x => !selected && x.selectedGroup !== undefined)

    const selectGroup = useEditorStore(x => x.selectGroup)

    function onClick() {
        if (selected) {
            selectGroup()
        } else {
            selectGroup(props.group)
        }
    }

    return (
        <div>
            <div className="py-1">
                <div
                    onClick={onClick}
                    className={
                        "flex items-center justify-between px-6 py-1 transition hover:cursor-pointer " +
                        (otherSelected ? " text-base-100 " : "") +
                        (!otherSelected && props.group.length > 0 ? " text-primary " : "") +
                        (!otherSelected && props.group.length === 0 ? " text-secondary " : "") +
                        (selected ? " bg-base-100 hover:bg-[#424242] " : "") +
                        (!selected ? " hover:bg-base-200 " : "")
                    }
                >
                    {props.group.length > 0 && (
                        <div className="flex items-center space-x-2">
                            <LayersSvg width="16" height="16" />
                            <div>{props.group}</div>
                        </div>
                    )}
                    {props.group.length === 0 && <div className="italic">Ungrouped</div>}

                    {otherSelected && (
                        <div className="text-base-100 flex justify-end px-2">
                            <EyeSlashSvg width="16" height="16" />
                        </div>
                    )}
                    {selected && <div className="flex justify-end px-2"></div>}
                </div>
            </div>
            <div className="flex">
                <div className="divider divider-horizontal mr-1" />
                {props.entities.map(([entityKey, entity]) => (
                    <HierarchyEntryEntity
                        key={entityKey}
                        entityKey={entityKey}
                        entitiy={entity}
                        hidden={otherSelected}
                    />
                ))}
            </div>
        </div>
    )
}

function HierarchyEntryEntity(props: {
    entityKey: string
    entitiy: Immutable<EditorEntity>
    hidden?: boolean
}) {
    const highlighted = useEditorStore(x => x.highlighted.has(props.entityKey))
    const selected = useEditorStore(x => x.selected.has(props.entityKey))
    const highlight = useEditorStore(x => x.highlight)
    const select = useEditorStore(x => x.select)

    const entityComponents: Record<EditorEntity["type"], React.ReactNode> = {
        flag: (
            <>
                <FlagSvg width="16" height="16" />
                <div>Flag</div>
            </>
        ),
        rocket: (
            <>
                <RocketSvg width="16" height="16" />
                <div>Rocket</div>
            </>
        ),
        shape: (
            <>
                <TriangleSvg width="16" height="16" />
                <div>Shape</div>
            </>
        ),
    }

    const EntityComponent = entityComponents[props.entitiy.type]

    function onClick(event: MouseEvent) {
        if (!props.hidden) {
            select(props.entityKey, event.shiftKey)
        }
    }

    function onMouseEnter() {
        if (!props.hidden) {
            highlight(props.entityKey)
        }
    }

    function onMouseLeave() {
        if (!props.hidden) {
            highlight()
        }
    }

    return (
        <>
            <div
                onClick={onClick}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                className={
                    "mr-4 flex w-full items-center space-x-2 rounded px-2 py-1 transition " +
                    (props.hidden ? " text-base-100 " : "") +
                    (!props.hidden ? " text-primary hover:cursor-pointer " : "") +
                    (!props.hidden && selected && !highlighted ? " bg-base-100 " : "") +
                    (highlighted && !selected ? " bg-base-200 " : "") +
                    (highlighted && selected ? " bg-[#424242] " : "")
                }
            >
                {EntityComponent}
            </div>
        </>
    )
}
