import { Immutable } from "immer"
import { useEffect } from "react"
import { z } from "zod"
import { ArrowClockwise } from "../../components/common/svg/ArrowClockwise"
import { ArrowCounterClockwise } from "../../components/common/svg/ArrowCounterClockwise"
import { List } from "../../components/common/svg/List"
import { useEditorStore, WorldChange } from "./store/store"
import { EditorWorld } from "./store/world"
import { Canvas } from "./views/canvas/Canvas"
import { Hierarchy } from "./views/hierarchy/Hierarchy"
import { Inspector } from "./views/inspector/Inspector"

export function Editor() {
    return (
        <div className="relative h-screen w-full grow">
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
        <div className="border-base-200 pointer-events-auto flex w-min items-center rounded-2xl border-2 bg-black bg-opacity-50 backdrop-blur-2xl">
            <div className="join flex">
                <div className="join-item btn btn-square btn-ghost rounded-2xl">
                    <List width="24" height="24" />
                </div>
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
            </div>
        </div>
    )
}
