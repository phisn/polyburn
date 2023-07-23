import { Transition } from "@headlessui/react"
import { useEffect, useRef, useState } from "react"
import { Pencil } from "../../../common/inline-svg/Pencil"
import { PencilSquare } from "../../../common/inline-svg/PencilSquare"
import { X } from "../../../common/inline-svg/X"

export function GamemodeSelect() {
    const [gamemodes, setGamemodes] = useState<string[]>([
        "Normal",
        "Hard",
        "Reverse",
    ])
    const [selected, setSelected] = useState<number>(0)

    const [creatingGamemode, setCreatingGamemode] = useState(false)

    return (
        <div className="absolute right-8 top-8">
            <div className="join join-vertical flex w-[12rem] flex-col backdrop-blur-2xl">
                {gamemodes.map((gamemode, i) => (
                    <GamemodeOption
                        first={i === 0}
                        key={i}
                        gamemode={gamemode}
                        selected={i === selected}
                        onSelect={() => setSelected(i)}
                        onRename={name => {
                            setGamemodes(
                                gamemodes.map((gamemode, j) =>
                                    j === i ? name : gamemode,
                                ),
                            )
                        }}
                    />
                ))}

                <Transition
                    show={creatingGamemode}
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
                            setCreatingGamemode(false)
                        }}
                        onCancel={() => setCreatingGamemode(false)}
                    />
                </Transition>
                <button
                    className="join-item btn w-full bg-opacity-20 text-zinc-50"
                    onClick={() => {
                        setCreatingGamemode(true)
                        setSelected(gamemodes.length)
                    }}
                >
                    + Gamemode
                </button>
            </div>
        </div>
    )
}

function GamemodeOption(props: {
    first: boolean
    gamemode: string
    selected: boolean
    onSelect: () => void
    onRename: (name: string) => void
}) {
    const menuRef = useRef<HTMLUListElement>(null)

    const [contextOpened, setContextOpened] = useState(false)
    const [renaming, setRenaming] = useState(false)

    useEffect(() => {
        if (contextOpened || renaming) {
            const listener = (e: PointerEvent) => {
                if (
                    e.target instanceof Node &&
                    !menuRef.current?.contains(e.target)
                ) {
                    setContextOpened(false)
                    setRenaming(false)
                }
            }

            window.addEventListener("pointerdown", listener)

            return () =>
                void window.removeEventListener("pointerdown", listener)
        }
    }, [contextOpened])

    useEffect(() => {
        if (renaming && props.selected === false) {
            setRenaming(false)
        }
    }, [renaming, props.selected])

    return (
        <>
            {renaming && (
                <GamemodeRenamer
                    first={props.first}
                    gamemode={props.gamemode}
                    onRename={gamemode => {
                        props.onRename(gamemode)
                        setRenaming(false)
                    }}
                    onCancel={() => {
                        setContextOpened(false)
                        setRenaming(false)
                    }}
                />
            )}
            {!renaming && (
                <div
                    onContextMenu={e => {
                        e.preventDefault()
                        setContextOpened(true)
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
                show={contextOpened && !renaming}
                className=" overflow-clip"
                enter="duration-200"
                enterFrom="max-h-0"
                enterTo="max-h-96"
                leave="duration-200"
                leaveFrom="max-h-96"
                leaveTo="max-h-0"
                appear
            >
                <ul ref={menuRef} className="menu relative p-0 py-2">
                    <li className="w-full">
                        <ul className="space-y-1">
                            <li>
                                <a
                                    className="space-x-1 pl-3"
                                    onClick={() => {
                                        setRenaming(true)
                                        setContextOpened(false)
                                        props.onSelect()
                                    }}
                                >
                                    <PencilSquare
                                        width="16"
                                        height="16"
                                        className="scale-125 transform rounded-none"
                                    />
                                    <div>Rename</div>
                                </a>
                            </li>
                            <li>
                                <a className="space-x-1 pl-3">
                                    <X
                                        width="16"
                                        height="16"
                                        className="scale-150 transform"
                                    />
                                    <div>Remove</div>
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </Transition>
        </>
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
                    props.first
                        ? "rounded-b-none rounded-r-none"
                        : "rounded-none"
                }`}
                onChange={e => setGamemode(e.target.value)}
                onKeyDown={e => {
                    if (
                        e.key === "Enter" &&
                        gamemode.length > 0 &&
                        gamemode.length <= 14
                    ) {
                        props.onRename(gamemode)
                    }
                }}
                value={gamemode}
            ></input>
            <button
                className={`btn btn-square bg-opacity-20 text-zinc-50 ${
                    props.first
                        ? "rounded-b-none rounded-l-none"
                        : "rounded-none"
                }`}
                disabled={gamemode.length === 0 || gamemode.length > 14}
                onClick={() => {
                    props.onRename(gamemode)
                }}
            >
                <Pencil width="16" height="16" className="rounded-none" />
            </button>
        </div>
    )
}
