import { Menu, MenuItem, MenuItems } from "@headlessui/react"
import { Immutable } from "immer"
import { ContextMenu } from "radix-ui"
import { useEffect, useRef, useState } from "react"
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
                <HierarchyGamemodeAdd />
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
    const updateWorld = useEditorStore(x => x.updateWorld)

    function onClick() {
        if (selected) {
            selectGamemode()
        } else {
            selectGamemode(props.gamemodeName)
        }
    }

    function onRemove() {
        updateWorld(world => {
            delete world.gamemodes[props.gamemodeName]
        })
    }

    return (
        <>
            <ContextMenu.Root>
                <ContextMenu.Trigger>
                    <div
                        onClick={onClick}
                        className={
                            "flex items-center space-x-2 px-6 py-2 transition hover:cursor-pointer " +
                            (selected
                                ? "bg-primary hover:bg-base-100 text-black"
                                : "hover:bg-base-200")
                        }
                    >
                        {selected && <MapFilledSvg width="16" height="16" />}
                        {!selected && <MapSvg width="16" height="16" />}

                        <div>{props.gamemodeName}</div>
                    </div>
                </ContextMenu.Trigger>
                <ContextMenu.Portal>
                    <ContextMenu.Content className="z-50">
                        <Menu as="div">
                            <MenuItems as="ul" static className="menu bg-base-300 rounded-box w-48">
                                <MenuItem as="li" className="">
                                    <a onClick={onRemove}>Remove</a>
                                </MenuItem>
                            </MenuItems>
                        </Menu>
                    </ContextMenu.Content>
                </ContextMenu.Portal>
            </ContextMenu.Root>
        </>
    )
}

function HierarchyGamemodeAdd() {
    const [open, setOpen] = useState(false)

    const buttonRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

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
                    className="btn btn-square btn-ghost btn-sm hover:bg-base-200 -my-2"
                >
                    <Plus width="16" height="16" />
                </div>
                {open && (
                    <div
                        ref={containerRef}
                        tabIndex={-1}
                        className="bg-base-300 absolute -left-4 right-0 m-2 w-screen max-w-xs rounded-2xl  p-2 py-4"
                    >
                        <HierarchyGamemodeAddNew
                            gamemodeSelected={""}
                            onEnter={() => setOpen(false)}
                        />
                    </div>
                )}
            </div>
        </>
    )
}

function HierarchyGamemodeAddNew(props: { gamemodeSelected: string; onEnter: () => void }) {
    const [name, setName] = useState("")

    const updateWorld = useEditorStore(x => x.updateWorld)

    const containerRef = useRef<HTMLDivElement>(null)

    function onAdd() {
        updateWorld(x => {
            x.gamemodes[name] = { groups: [] }
        })

        setName("")
        props.onEnter()
    }

    return (
        <div ref={containerRef} className="join relative w-full px-5 py-1">
            <input
                autoFocus
                className="input input-sm join-item bg-base-300 input-ghost w-full"
                placeholder="Enter gamemode name..."
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
}
