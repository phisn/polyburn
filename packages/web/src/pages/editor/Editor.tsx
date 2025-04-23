import { Transition } from "@headlessui/react"
import { WorldConfig } from "game/proto/world"
import { base64ToBytes } from "game/src/model/utils"
import { Immutable } from "immer"
import { Fragment, useEffect, useRef, useState } from "react"
import { z } from "zod"
import { useGlobalStore } from "../../common/store"
import { Plus } from "../../components/common/svg/PlusLg"
import { useEditorStore, WorldChange } from "./store/store"
import { configToEditorWorld, EditorWorld } from "./store/world"
import { Canvas } from "./views/canvas/Canvas"
import { Hierarchy } from "./views/hierarchy/Hierarchy"
import { Navbar } from "./views/navbar/Navbar"

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

        async function tryGzip(worldpacked: string) {
            try {
                const worldbytes = await new Response(
                    new ReadableStream({
                        start(x) {
                            x.enqueue(base64ToBytes(worldpacked))
                            x.close()
                        },
                    }).pipeThrough(new DecompressionStream("gzip")),
                ).bytes()

                return configToEditorWorld(WorldConfig.decode(worldbytes))
            } catch (e: any) {
                console.warn(e)
            }
        }

        function tryRaw(worldpacked: string) {
            try {
                return configToEditorWorld(WorldConfig.decode(base64ToBytes(worldpacked)))
            } catch (e: any) {
                console.warn(e)
            }
        }

        const worldpacked = await file.text()

        let worldnew: EditorWorld | undefined

        worldnew ??= await tryGzip(worldpacked)
        worldnew ??= tryRaw(worldpacked)

        if (worldnew === undefined) {
            useGlobalStore.getState().newAlert({
                message: "Failed to load world from file",
                type: "warning",
            })

            return
        }

        useEditorStore.getState().updateWorld(world => {
            for (const key in world) {
                delete world[key as keyof typeof world]
            }

            for (const key in worldnew) {
                world[key as keyof typeof worldnew] = worldnew[key as keyof typeof worldnew] as any
            }
        })

        useGlobalStore.getState().newAlert({
            message: "Loaded world from file",
            type: "success",
        })
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
        try {
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
        } catch (e: any) {
            console.error(e)
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
