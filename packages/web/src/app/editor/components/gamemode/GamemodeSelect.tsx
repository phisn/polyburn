import { Transition } from "@headlessui/react"
import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "../../../../common/components/inline-svg/ChevronDown"
import { ChevronUp } from "../../../../common/components/inline-svg/ChevronUp"
import { ListTask } from "../../../../common/components/inline-svg/ListTask"
import { Pencil } from "../../../../common/components/inline-svg/Pencil"
import { PencilSquare } from "../../../../common/components/inline-svg/PencilSquare"
import { X } from "../../../../common/components/inline-svg/X"
import { GamemodeState } from "../../models/world-state"
import { useEditorStore } from "../../store/EditorStore"
import { useUnclick } from "../../use-unclick"
import { gamemodeEditGroup } from "./mutations/gamemode-edit-group"
import { gamemodeNew } from "./mutations/gamemode-new"
import { gamemodeRename } from "./mutations/gamemode-rename"
import { gamemodeToggleGroup } from "./mutations/gamemode-toggle-group"

export function GamemodeSelect() {
    const gamemodes = useEditorStore(store => store.state).world.gamemodes

    interface CreatingGamemode {
        previousSelected: number
    }

    const [creatingGamemode, setCreatingGamemode] = useState<CreatingGamemode | null>(null)

    const dispatch = useEditorStore(store => store.mutation)
    const selected = useEditorStore(store => store.gamemode)

    return (
        <div className="absolute right-8 top-8">
            <div className="join join-vertical flex w-[16rem] flex-col backdrop-blur-2xl">
                {gamemodes.map((gamemode, i) => (
                    <GamemodeOption
                        first={i === 0}
                        key={i}
                        gamemode={gamemode}
                        selected={gamemode === selected && !creatingGamemode}
                    />
                ))}

                <Transition
                    show={creatingGamemode !== null}
                    className="join-item relative z-40"
                    enter="duration-200"
                    enterFrom="max-h-0 overflow-clip"
                    enterTo="max-h-96 overflow-visible"
                    leave="duration-200"
                    leaveFrom="max-h-96 overflow-clip"
                    leaveTo="max-h-0 overflow-clip"
                    appear
                >
                    <GamemodeRenamer
                        first={false}
                        gamemode=""
                        onRename={gamemode => {
                            dispatch(gamemodeNew(gamemode))
                            setCreatingGamemode(null)
                        }}
                        onCancel={() => {
                            setCreatingGamemode(null)
                        }}
                    />
                </Transition>
                <button
                    className="join-item btn w-full !bg-opacity-20 text-zinc-50"
                    onClick={() => {
                        setCreatingGamemode({ previousSelected: 0 })
                    }}
                >
                    + Gamemode
                </button>
            </div>
        </div>
    )
}

export enum GamemodeOptionType {
    None,
    Context,
    Groups,
    Rename,
    Remove,
}

function GamemodeOption(props: { first: boolean; gamemode: GamemodeState; selected: boolean }) {
    const [mode, setMode] = useState(GamemodeOptionType.None)

    const dispatch = useEditorStore(store => store.mutation)
    const selectGamemode = useEditorStore(store => store.selectGamemode)

    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!props.selected && mode !== GamemodeOptionType.None) {
            setMode(GamemodeOptionType.None)
        }
    }, [props.selected, mode])

    useUnclick(ref, () => {
        if (mode !== GamemodeOptionType.None) {
            setMode(GamemodeOptionType.None)
        }
    })

    return (
        <div ref={ref} className="join-item">
            {mode === GamemodeOptionType.Rename && (
                <GamemodeRenamer
                    first={props.first}
                    gamemode={props.gamemode.name}
                    onRename={gamemode => {
                        dispatch(gamemodeRename(props.gamemode, gamemode))
                        setMode(GamemodeOptionType.None)
                    }}
                    onCancel={() => {
                        setMode(GamemodeOptionType.None)
                    }}
                />
            )}
            {mode !== GamemodeOptionType.Rename && (
                <div
                    className="relative"
                    onContextMenu={e => {
                        e.preventDefault()
                        selectGamemode(props.gamemode)
                        setMode(GamemodeOptionType.Context)
                    }}
                >
                    <div
                        className={`join-item btn flex w-full justify-between bg-opacity-60 text-zinc-50 ${
                            props.selected
                                ? "!btn-active !btn-success relative z-10" // z-10 to prevent overlap with other buttons
                                : ""
                        }`}
                        onClick={() => {
                            if (!props.selected) {
                                selectGamemode(props.gamemode)
                            } else if (mode === GamemodeOptionType.Context) {
                                setMode(GamemodeOptionType.None)
                            } else {
                                setMode(GamemodeOptionType.Context)
                            }
                            console.log("toggle")
                        }}
                    >
                        <div className="grid w-full grid-cols-3 items-center">
                            <div className="col-start-2">{props.gamemode.name}</div>

                            {props.selected && (
                                <label className="swap swap-rotate justify-self-end rounded-lg p-2">
                                    <input
                                        type="checkbox"
                                        disabled
                                        onChange={() => {
                                            selectGamemode(props.gamemode)

                                            if (mode !== GamemodeOptionType.None) {
                                                setMode(GamemodeOptionType.None)
                                            } else {
                                                setMode(GamemodeOptionType.Context)
                                            }
                                        }}
                                        checked={mode !== GamemodeOptionType.None}
                                    />
                                    <ChevronDown
                                        className="swap-on"
                                        width="16"
                                        height="16"
                                        fill={props.selected ? "black" : ""}
                                    />
                                    <ChevronUp
                                        className="swap-off"
                                        width="16"
                                        height="16"
                                        fill={props.selected ? "black" : ""}
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <Transition
                show={mode === GamemodeOptionType.Context}
                className="bg-base-300 overflow-clip rounded-none bg-opacity-80"
                enter="duration-200"
                enterFrom="max-h-0"
                enterTo="max-h-96"
                leave="duration-200"
                leaveFrom="max-h-96"
                leaveTo="max-h-0"
                appear
            >
                <GamemodeOptionSelection
                    onType={type => {
                        if (
                            type !== GamemodeOptionType.None &&
                            type !== GamemodeOptionType.Context &&
                            !props.selected
                        ) {
                            selectGamemode(props.gamemode)
                        }

                        console.log(type)

                        setMode(type)
                    }}
                />
            </Transition>
            <Transition
                show={mode === GamemodeOptionType.Groups}
                className="bg-base-300 overflow-clip rounded-none bg-opacity-80"
                enter="duration-200"
                enterFrom="max-h-0"
                enterTo="max-h-96"
                leave="duration-200"
                leaveFrom="max-h-96"
                leaveTo="max-h-0"
                appear
            >
                <GamemodeOptionGroups gamemode={props.gamemode} />
            </Transition>
        </div>
    )
}

function GamemodeOptionGroups(props: { gamemode: GamemodeState }) {
    const [creating, setCreating] = useState(false)

    const dispatch = useEditorStore(store => store.mutation)
    const world = useEditorStore(store => store.state).world

    const groups = [
        ...world.gamemodes.flatMap(gamemode => gamemode.groups),
        ...[...world.entities.values()]
            .filter(entity => entity.group)
            .map(entity => entity.group as string),
    ]
        .filter((group, i, arr) => arr.indexOf(group) === i)
        .sort()

    return (
        <ul className="menu relative mr-2 w-full p-0 py-2">
            <li className="w-full">
                <ul className="w-full space-y-1 pr-4">
                    {groups.map((group, i) => (
                        <Group
                            key={i}
                            name={group}
                            gamemode={props.gamemode}
                            selected={props.gamemode.groups.includes(group)}
                        />
                    ))}

                    {creating && (
                        <GroupRename
                            name=""
                            gamemode={props.gamemode}
                            onRename={name => {
                                dispatch(gamemodeToggleGroup(props.gamemode, name))
                                setCreating(false)
                            }}
                            onCancel={() => {
                                setCreating(false)
                            }}
                        />
                    )}
                </ul>
            </li>
            <CreateGroupButton onCreate={() => setCreating(true)} />
        </ul>
    )
}

function CreateGroupButton(props: { onCreate: () => void }) {
    return (
        <>
            <li className="w-full">
                <label className="label flex w-full cursor-pointer">
                    <button
                        className="btn-block bg-white bg-opacity-5 py-1"
                        onClick={() => props.onCreate()}
                    >
                        + GROUP
                    </button>
                </label>
            </li>
        </>
    )
}

function Group(props: { name: string; gamemode: GamemodeState; selected: boolean }) {
    const [editing, setEditing] = useState(false)

    const dispatch = useEditorStore(store => store.mutation)

    return (
        <>
            {!editing && (
                <li className="h-9 w-full">
                    <label
                        className="label flex w-full cursor-pointer"
                        onContextMenu={e => {
                            setEditing(true)
                            e.preventDefault()
                        }}
                    >
                        <span className="label-text mr-3 flex w-full overflow-hidden">
                            {props.name}
                        </span>
                        <input
                            type="checkbox"
                            className="checkbox checkbox-success checkbox-sm border-zinc-400"
                            onChange={() => {
                                dispatch(gamemodeToggleGroup(props.gamemode, props.name))
                            }}
                            checked={props.selected}
                        />
                    </label>
                </li>
            )}
            {editing && (
                <GroupRename
                    name={props.name}
                    gamemode={props.gamemode}
                    onRename={name => {
                        dispatch(gamemodeEditGroup(props.name, name))
                        setEditing(false)
                    }}
                    onCancel={() => {
                        setEditing(false)
                    }}
                />
            )}
        </>
    )
}

function GroupRename(props: {
    name: string
    gamemode: GamemodeState
    onRename: (name: string) => void
    onCancel: () => void
}) {
    const [name, setName] = useState(props.name)

    const ref = useRef<HTMLDivElement>(null)

    useUnclick(ref, () => {
        props.onCancel()
    })

    return (
        <div className="join join-horizontal ml-[0.2rem] flex h-9 pl-0 pr-2.5 pt-0.5" ref={ref}>
            <input
                autoFocus
                type="text"
                className="input join-item input-sm w-full bg-zinc-950 bg-opacity-70 text-white !outline-none"
                onChange={e => setName(e.target.value)}
                onKeyDown={e => {
                    if (e.key === "Enter" && name.length > 0 && name.length <= 14) {
                        if (name !== props.name) {
                            props.onRename(name)
                        } else {
                            props.onCancel()
                        }
                    }
                }}
                value={name}
            />
            <button
                className="btn btn-sm join-item btn-square border-none bg-zinc-950 bg-opacity-100 text-zinc-50"
                disabled={name.length === 0 || name.length > 14}
                onClick={() => {
                    if (name !== props.name) {
                        props.onRename(name)
                    } else {
                        props.onCancel()
                    }
                }}
            >
                <Pencil width="16" height="16" className="rounded-none" />
            </button>
        </div>
    )
}

function GamemodeOptionSelection(props: { onType: (type: GamemodeOptionType) => void }) {
    return (
        <ul className="menu relative mr-2 p-0 py-2">
            <li className="w-full">
                <ul className="space-y-1">
                    <li>
                        <a
                            className="flex space-x-1 pl-3"
                            onClick={() => {
                                props.onType(GamemodeOptionType.Groups)
                            }}
                        >
                            <ListTask width="16" height="16" className="mt-0.5 rounded-none" />
                            <div>Groups</div>
                        </a>
                    </li>
                    <li>
                        <a
                            className="space-x-1 pl-3"
                            onClick={() => {
                                props.onType(GamemodeOptionType.Rename)
                            }}
                        >
                            <PencilSquare width="16" height="16" className="mt-0.5 rounded-none" />
                            <div>Rename</div>
                        </a>
                    </li>
                    <li>
                        <a className="space-x-1 pl-3">
                            <X width="16" height="16" className="mt-0.5 scale-150 transform" />
                            <div>Remove</div>
                        </a>
                    </li>
                </ul>
            </li>
        </ul>
    )
}

function GamemodeRenamer(props: {
    first: boolean
    gamemode: string
    onRename: (name: string) => void
    onCancel: () => void
}) {
    const [gamemode, setGamemode] = useState(props.gamemode)

    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const listener = (e: PointerEvent) => {
            if (e.target instanceof Node && !ref.current?.contains(e.target)) {
                props.onCancel()
            }
        }

        window.addEventListener("pointerdown", listener)

        return () => void window.removeEventListener("pointerdown", listener)
    }, [props])

    return (
        <div className="join-item flex" ref={ref}>
            <input
                autoFocus
                type="text"
                className={`input input-success bg-success relative w-full text-black ${
                    props.first ? "rounded-b-none rounded-r-none" : "rounded-none"
                }`}
                onChange={e => setGamemode(e.target.value)}
                onKeyDown={e => {
                    if (e.key === "Enter" && gamemode.length > 0 && gamemode.length <= 14) {
                        if (props.gamemode === gamemode) {
                            props.onCancel()
                        } else {
                            props.onRename(gamemode)
                        }
                    }
                }}
                value={gamemode}
            ></input>
            <button
                className={`btn btn-square bg-opacity-20 text-zinc-50 ${
                    props.first ? "rounded-b-none rounded-l-none" : "rounded-none"
                }`}
                disabled={gamemode.length === 0 || gamemode.length > 14}
                onClick={() => {
                    if (props.gamemode === gamemode) {
                        props.onCancel()
                    } else {
                        props.onRename(gamemode)
                    }
                }}
            >
                <Pencil width="16" height="16" className="rounded-none" />
            </button>
        </div>
    )
}
