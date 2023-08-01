import { Transition } from "@headlessui/react"
import { useEffect, useRef, useState } from "react"
import { ListTask } from "../../../common/components/inline-svg/ListTask"
import { Pencil } from "../../../common/components/inline-svg/Pencil"
import { PencilSquare } from "../../../common/components/inline-svg/PencilSquare"
import { X } from "../../../common/components/inline-svg/X"

export function GamemodeSelect() {
    const [gamemodes, setGamemodes] = useState<string[]>(["Normal", "Hard", "Reverse"])

    interface CreatingGamemode {
        previousSelected: number
    }

    const [selected, setSelected] = useState<number>(0)
    const [creatingGamemode, setCreatingGamemode] = useState<CreatingGamemode | null>(null)

    return (
        <div className="absolute right-8 top-8">
            <div className="join join-vertical flex w-[16rem] flex-col backdrop-blur-2xl">
                {gamemodes.map((gamemode, i) => (
                    <GamemodeOption
                        first={i === 0}
                        key={i}
                        gamemode={gamemode}
                        selected={i === selected}
                        onSelect={() => setSelected(i)}
                        onRename={name => {
                            setGamemodes(
                                gamemodes.map((gamemode, j) => (j === i ? name : gamemode)),
                            )
                        }}
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
                            setGamemodes([...gamemodes, gamemode])
                            setSelected(gamemodes.length)
                            setCreatingGamemode(null)
                        }}
                        onCancel={() => {
                            setSelected(creatingGamemode?.previousSelected ?? 0)
                            setCreatingGamemode(null)
                        }}
                    />
                </Transition>
                <button
                    className="join-item btn w-full !bg-opacity-20 text-zinc-50"
                    onClick={() => {
                        setCreatingGamemode({ previousSelected: selected })
                        setSelected(gamemodes.length)
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

function GamemodeOption(props: {
    first: boolean
    gamemode: string
    selected: boolean
    onSelect: () => void
    onRename: (name: string) => void
}) {
    const [mode, setMode] = useState(GamemodeOptionType.None)

    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (mode !== GamemodeOptionType.Context) {
            const listener = (e: PointerEvent) => {
                if (e.target instanceof Node && !ref.current?.contains(e.target)) {
                    setMode(GamemodeOptionType.None)
                }
            }

            window.addEventListener("pointerdown", listener)

            return () => void window.removeEventListener("pointerdown", listener)
        }
    }, [])

    return (
        <div ref={ref} className="join-item">
            {mode === GamemodeOptionType.Rename && (
                <GamemodeRenamer
                    first={props.first}
                    gamemode={props.gamemode}
                    onRename={gamemode => {
                        props.onRename(gamemode)
                        setMode(GamemodeOptionType.None)
                    }}
                    onCancel={() => {
                        setMode(GamemodeOptionType.None)
                    }}
                />
            )}
            {mode !== GamemodeOptionType.Rename && (
                <div
                    onContextMenu={e => {
                        e.preventDefault()
                        setMode(GamemodeOptionType.Context)
                    }}
                >
                    <button
                        className={`join-item btn w-full bg-opacity-60 text-zinc-50 ${
                            props.selected
                                ? "btn-disabled !btn-active !btn-success relative z-10" // z-10 to prevent overlap with other buttons
                                : ""
                        }`}
                        onClick={props.onSelect}
                    >
                        {props.gamemode}
                    </button>
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
                            props.onSelect()
                        }

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

function GamemodeOptionGroups(props: { gamemode: string }) {
    return (
        <ul className="menu relative mr-2 p-0 py-2">
            <li className="w-full">
                <ul className="w-full space-y-1 pr-4">
                    <Group name="Normal" gamemode={props.gamemode} />
                    <Group name="Normal Shapes" gamemode={props.gamemode} />
                    <Group name="Normal Flags" gamemode={props.gamemode} />
                    <Group name="Reverse Flags" gamemode={props.gamemode} />
                    <Group name="Hard flags" gamemode={props.gamemode} />
                    <Group name="Hard shortcut" gamemode={props.gamemode} />
                </ul>
            </li>
            <GroupCreator />
        </ul>
    )
}

function GroupCreator() {
    const [creating, setCreating] = useState(false)
    const [name, setName] = useState("")

    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (creating) {
            const listener = (e: PointerEvent) => {
                if (e.target instanceof Node && !ref.current?.contains(e.target)) {
                    setCreating(false)
                }
            }

            window.addEventListener("pointerdown", listener)

            return () => void window.removeEventListener("pointerdown", listener)
        }
    }, [creating])

    return (
        <>
            {!creating && (
                <li className="w-full">
                    <label className="label flex w-full cursor-pointer">
                        <button
                            className="btn-block bg-white bg-opacity-5 py-1"
                            onClick={() => setCreating(true)}
                        >
                            + GROUP
                        </button>
                    </label>
                </li>
            )}
            {creating && (
                <div className="join join-horizontal w-full p-2" ref={ref}>
                    <input
                        autoFocus
                        type="text"
                        className="input join-item relative w-full bg-white bg-opacity-80 text-black"
                        onChange={e => setName(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter" && name.length > 0 && name.length <= 14) {
                            }
                        }}
                        placeholder="Group name"
                    ></input>
                    <button
                        className="btn join-item btn-square bg-opacity-20 text-zinc-50"
                        disabled={name.length === 0 || name.length > 14}
                        onClick={() => {}}
                    >
                        <PencilSquare width="16" height="16" className="rounded-none" />
                    </button>
                </div>
            )}
        </>
    )
}

function Group(props: { name: string; gamemode: string }) {
    return (
        <li className="w-full">
            <label className="label flex w-full cursor-pointer">
                <span className="label-text mr-3 flex w-full overflow-hidden">{props.name}</span>
                <input
                    type="checkbox"
                    className="checkbox checkbox-success checkbox-sm border-zinc-400"
                />
            </label>
        </li>
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
    }, [])

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
