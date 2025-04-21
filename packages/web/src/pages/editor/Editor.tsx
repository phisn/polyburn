import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react"
import { saveAs } from "file-saver"
import { base64ToBytes, bytesToBase64 } from "game/src/model/utils"
import { Immutable } from "immer"
import { Fragment, useEffect, useRef, useState } from "react"
import { z } from "zod"
import { useGlobalStore } from "../../common/store"
import { ArrowClockwise } from "../../components/common/svg/ArrowClockwise"
import { ArrowCounterClockwise } from "../../components/common/svg/ArrowCounterClockwise"
import { BoxArrowInDownLeft } from "../../components/common/svg/BoxArrowInDownLeft"
import { List } from "../../components/common/svg/List"
import { PlayFilled } from "../../components/common/svg/PlayFilled"
import { Plus } from "../../components/common/svg/PlusLg"
import { useEditorStore, WorldChange } from "./store/store"
import { EditorWorld } from "./store/world"
import { Canvas } from "./views/canvas/Canvas"
import { Hierarchy } from "./views/hierarchy/Hierarchy"
import { Inspector } from "./views/inspector/Inspector"

export function Editor() {
    return (
        <FileDropContainer>
            <EditorStorage />

            <div className="absolute inset-0">
                <Canvas />
            </div>

            <div className="pointer-events-none absolute bottom-0 left-0 right-0 top-0 z-10 flex grow select-none space-x-4 p-4">
                <Hierarchy />

                <div className="flex-grow">
                    <Navbar />
                </div>

                <Inspector />
            </div>
        </FileDropContainer>
    )
}

function FileDropContainer(props: { children: React.ReactNode }) {
    const [draggingOver, setDraggingOver] = useState(false)
    const draggingRef = useRef(0)

    async function onDrop(event: React.DragEvent) {
        draggingRef.current = 0
        setDraggingOver(draggingRef.current > 0)

        const file = event.dataTransfer.items
            ? [...event.dataTransfer.items].find(x => x.kind === "file")?.getAsFile()
            : [...event.dataTransfer.files].at(0)

        if (!file) {
            return
        }

        let worldany: unknown

        try {
            const worldpacked = await file.text()

            const worldstr = await new Response(
                new ReadableStream({
                    start(x) {
                        x.enqueue(base64ToBytes(worldpacked))
                        x.close()
                    },
                }).pipeThrough(new DecompressionStream("gzip")),
            ).bytes()

            console.log(worldpacked)

            worldany = JSON.parse(new TextDecoder().decode(worldstr))
        } catch (_e: any) {
            useGlobalStore.getState().newAlert({
                message: "Failed to parse file",
                type: "warning",
            })

            return
        }

        const worldparsed = EditorWorld.safeParse(worldany)

        if (worldparsed.success) {
            useEditorStore.getState().updateWorld(world => {
                for (const key in world) {
                    delete world[key as keyof typeof world]
                }

                for (const key in worldparsed.data) {
                    world[key as keyof typeof world] = worldparsed.data[
                        key as keyof typeof world
                    ] as any
                }
            })

            useGlobalStore.getState().newAlert({
                message: "Loaded world from file",
                type: "success",
            })
        } else {
            useGlobalStore.getState().newAlert({
                message: "Failed to load world from file",
                type: "warning",
            })
        }
    }

    function onDraggingOver(event: React.DragEvent) {
        if (event.dataTransfer.types.includes("Files")) {
            event.preventDefault()
            event.stopPropagation()
        }
    }

    function onDraggingEnter(event: React.DragEvent) {
        if (event.dataTransfer.types.includes("Files")) {
            draggingRef.current = draggingRef.current + 1
            setDraggingOver(draggingRef.current > 0)

            event.preventDefault()
            event.stopPropagation()
        }
    }

    function onDraggingLeave(event: React.DragEvent) {
        if (event.dataTransfer.types.includes("Files")) {
            draggingRef.current = draggingRef.current - 1
            setDraggingOver(draggingRef.current > 0)

            event.preventDefault()
            event.stopPropagation()
        }
    }
    return (
        <div
            className={"relative h-screen w-full grow"}
            onDrop={onDrop}
            onDragOver={onDraggingOver}
            onDragEnter={onDraggingEnter}
            onDragLeave={onDraggingLeave}
            onDragExit={onDraggingLeave}
            onDragEnd={onDraggingLeave}
        >
            <Transition
                show={draggingOver}
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0"
                enterTo="transform opacity-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100"
                leaveTo="transform opacity-0"
            >
                <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center blur-none">
                    <div className="flex items-center justify-center space-x-2 rounded-2xl bg-black bg-opacity-70 p-6 text-xl">
                        <Plus width="24" height="24" />
                        <div>Load world</div>
                    </div>
                </div>
            </Transition>
            <div
                className={
                    "relative h-screen w-full grow transition " +
                    (draggingOver ? " opacity-50 blur" : "")
                }
            >
                {props.children}
            </div>
        </div>
    )
}

interface EditorSaveState {
    world: Immutable<EditorWorld>
    worldRedo: WorldChange[]
    worldUndo: WorldChange[]
}

const EditorSaveState = z.object({
    world: EditorWorld,
    worldRedo: z.array(WorldChange),
    worldUndo: z.array(WorldChange),
})

function EditorStorage() {
    const world = useEditorStore(x => x.world)
    const worldRedo = useEditorStore(x => x.worldRedo)
    const worldUndo = useEditorStore(x => x.worldUndo)

    useEffect(() => {
        const parsed = EditorSaveState.safeParse(
            JSON.parse(localStorage.getItem("editorSaveState") ?? ""),
        )

        if (parsed.success) {
            useEditorStore.setState({
                world: parsed.data.world,
                worldRedo: parsed.data.worldRedo,
                worldUndo: parsed.data.worldUndo,
            })
        } else {
            localStorage.removeItem("editorSaveState")
        }
    }, [])

    useEffect(() => {
        const saveState: EditorSaveState = {
            world,
            worldRedo,
            worldUndo,
        }

        localStorage.setItem("editorSaveState", JSON.stringify(saveState))
    }, [world, worldRedo, worldUndo])

    return <></>
}

function Navbar() {
    const hasRedos = useEditorStore(x => x.worldRedo.length > 0)
    const hasUndos = useEditorStore(x => x.worldUndo.length > 0)

    const redo = useEditorStore(x => x.redo)
    const undo = useEditorStore(x => x.undo)

    return (
        <div className="border-base-200 bg-base-300 pointer-events-auto flex w-min items-center  rounded-2xl bg-opacity-80 backdrop-blur-2xl">
            <div className="join flex">
                <NavbarMenu />
                <div
                    onClick={() => undo()}
                    className={
                        "join-item btn btn-square btn-ghost rounded-2xl" +
                        (hasUndos ? "" : " btn-disabled ")
                    }
                >
                    <ArrowCounterClockwise width="20" height="20" />
                </div>
                <div
                    onClick={() => redo()}
                    className={
                        "join-item btn btn-square btn-ghost rounded-2xl" +
                        (hasRedos ? "" : " btn-disabled ")
                    }
                >
                    <ArrowClockwise width="20" height="20" />
                </div>
                <div className={"join-item btn btn-square btn-ghost rounded-2xl"}>
                    <PlayFilled width="20" height="20" />
                </div>
            </div>
        </div>
    )
}

function NavbarMenu() {
    async function onDownload() {
        const world = useEditorStore.getState().world

        const bytes = await new Response(
            new ReadableStream({
                start(x) {
                    x.enqueue(new TextEncoder().encode(JSON.stringify(world)))
                    x.close()
                },
            }).pipeThrough(new CompressionStream("gzip")),
        ).bytes()

        saveAs(
            new Blob([bytesToBase64(bytes)], { type: "application/octet-stream" }),
            "world.pbw",
            {
                autoBom: true,
            },
        )
    }

    return (
        <Menu as="div">
            <MenuButton className="btn btn-square join-item btn-ghost rounded-2xl">
                <List width="22" height="22" />
            </MenuButton>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0"
                enterTo="transform opacity-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100"
                leaveTo="transform opacity-0"
            >
                <MenuItems
                    as="ul"
                    className="menu rounded-box dropdown-content bg-base-300 border-base-200 absolute mt-2 w-56  bg-opacity-70 backdrop-blur-2xl"
                >
                    <MenuItem as="li">
                        <button onClick={() => onDownload()}>
                            <BoxArrowInDownLeft width="16" height="16" />
                            Download
                        </button>
                    </MenuItem>
                </MenuItems>
            </Transition>
        </Menu>
    )
}
