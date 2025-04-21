import { Transition } from "@headlessui/react"
import { WorldConfig } from "game/proto/world"
import { base64ToBytes } from "game/src/model/utils"
import { Immutable } from "immer"
import { Fragment, useEffect, useRef, useState } from "react"
import { z } from "zod"
import { useGlobalStore } from "../../common/store"
import { Plus } from "../../components/common/svg/PlusLg"
import { useEditorStore, WorldChange } from "./store/store"
import { configToEditorWorld, EditorWorld, editorWorldToConfig } from "./store/world"
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

        const test =
            "CscCCgZOb3JtYWwSvAIKCg2F65XBFTXTGkISKA2kcLrBFZfjFkIlAAAAwi1SuIlCNa5H+UE9H4X/QUUAAABATQAAAEASKA1SuMFBFZmRGkIlhetRQS3NzFJCNSlcp0I9zcxEQUUAAABATQAAAEASKA0AgEVCFfIboEElAAAoQi0K189BNaRw4UI9rkdZwUUAAABATQAAAEASKA171MBCFcubHcElmpm5Qi0K189BNY/CI0M9rkdZwUUAAABATQAAAEASLQ1syOFCFToytkEdVGuzOiWamblCLSlcZUI1XI8jQz3NzIhBRQAAAEBNAAAAQBItDR/lAUMVk9VNQh2fUDa1JaRw9UItexRsQjWF60FDPQAAlEFFAAAAQE0AAABAEigNw1UzQxVpqkFCJdejJEMtBW94QjXXo0JDPQVvAEJFAAAAQE0AAABACu4KCg1Ob3JtYWwgU2hhcGVzEtwKGt8GCtwGP4UAws3MNEGgEEAAZjYAAP///wB1PAAU////AF5PABT///8AyUtPxP///wAzSg3L////AMBJAcj///8AE0Umzf///wCMVAo5////AJNRpDr///8AVE0WVP///wD0vlZLAAD/AEPI7Bn///8AhcPlOAAA/wAFQZrF////ADS9F8f///8AJMIuwf///wC5xvvF////AOrJ1rf///8Ac8ikQP///wBAxfRF////AGkxi0n///8Aj0LxQgAA/wB1xWY9////AJ/HZAlQUP4AzcUBvQAA/wDwQFzE////ADDGR73///8As8eZPoiI8QBxxWQ3rKz/AFw3LMQAAP8AwkNRtP///wC2RKO4////AEhBe8EAAP8AS0WPPP///wAdSaSx////AMw/Ucj///8A7MBNxv///wDmxnG9////AELCFLr///8Aw8UOof///wAKxCg4AAD/ALg8OMDZ2fsA4j9NwP///wCkxB+/AADwAHGwrr54ePgAVERcwv///wAPwXbA////APW0H0EAAPgASLtnv////wALM67DJSX/AFJApL////8AZj4uwP///wBcu+HATU3/AIU7+8H///8AXMK8Lf///wB7wjM/AAD4AHDCx8D///8AFEH7wP///wAAvnvE////AOTGChL///8A6bncRP///wCAQddAAAD4AB/AxLH///8AIL9RPQAA+ACZwqvG////AOLCLkQAAPgAIcTrwP///wDtwQPH////AOLJbqz///8ALsR6QwAA+AD+x8zA////APtF90kyMv8AH7mZQCcn/wCNxHo8tbX/AIDAiETKyv8AXEAgSgAA+AClyAqS////AH9EG0n///8AS0ypRP///wAxSIK7MDToANjBdUf///8A58yjxP///wCByD1EMDToAIzCYMv///8AnMq3MzA06AC+QenF////ANzGT0T///8AtMFSR////wBzRb85lpj/AFJALEQwNOgAqMIpPjA06AAgyiCF////AAPEE77///8AzT4FSnN1/wAzxWFCMDToAA23PcKXl/8AGcLmQDA06ADMPUnJu77/AFrGxsL///8A1TRGSjA06ACKwik8MDToAE3Apcn///8Ar8SawP///wBsygqP////ABHI8z0wNOgAAABTzv///wAa9wMK9APNzJNCj8JlQP///wBmtly8////ABa2jsg2Nv8AO0SENwAA+ACkvrtEvLz/AG0uOEX///8A4UaHPv///wA+QlXFAAD4AApB2L4AAPgAeDLVRP///wATSHHAAAD4ADhA3EP///8As0MKvAAA8ADOPxM4AAD4AEjBTUD///8Arj5TP3B0+ACyKw9DaGz4ALm6eDz///8AKT4MSP///wDhPy5CAAD/APS/XEL///8A+EV6PwAA/wAdsXtBp6f/AGzEpEEAAP8AisfEuf///wDXwVJI////AJpEaUf///8AhUfxQP///wB7RA3FAAD/ANdBTzUAAP8AC8C9Rv///wBGQoVE////APRMpDz///8A7kS3yAAA/wDLR9HB////AFLHNscAAP8AR0HNwf///wDsvtLGAAD/AABE5kD///8AD0JIRv///wD0RNJA////AEVFqcD///8A3ESpwwAA/wAuwgtJ////AARBqEj///8ALUdbSf///wA01Hks////AHjCAL3///8AF8s5x////wC4vlPP////AME1O8f///8AhsIAPgAA+ABcxZXC7e3/AIrEpUMAAPgAjcbDxcvL/wBdQFzF////AEjI+8EAAOAAQ0GZvf///wAGN77AFRX/APlFXDz///8AikEzwkhI+ADcQmoy////AArNAgoHUmV2ZXJzZRLBAgoPDRydLkMVk5lFQh2z7Zk2EigNpHC6wRWX4xZCJQAAAMItAABMQjUAAEDBPR+F/0FFAAAAQE0AAABAEigNUrjBQRWZkRpCJR+FAMItZuaJQjUAAPpBPQAAAEJFAAAAQE0AAABAEigNAIBFQhXyG6BBJQAAUEEthetRQjWkcKdCPVK4TkFFAAAAQE0AAABAEigNe9TAQhXLmx3BJTQzKEItCtfPQTUeBeJCPa5HWcFFAAAAQE0AAABAEi0NbMjhQhU6MrZBHVRrszolmpm5Qi1SuNRBNVyPI0M9ZmZawUUAAABATQAAAEASLQ0f5QFDFZPVTUIdn1A2tSWk8LlCLXsUZUI1hSskQz0AAIZBRQAAAEBNAAAAQBIoDcNVM0MVaapBQiUAgPVCLQAAbEI1AABCQz0AAJRBRQAAAEBNAAAAQBIhCgZOb3JtYWwSFwoNTm9ybWFsIFNoYXBlcwoGTm9ybWFsEiMKB1JldmVyc2USGAoNTm9ybWFsIFNoYXBlcwoHUmV2ZXJzZRIfCgRIYXJkEhcKBk5vcm1hbAoNTm9ybWFsIFNoYXBlcw=="

        const testw = WorldConfig.decode(base64ToBytes(test))
        const w = editorWorldToConfig(worldnew)

        console.log(JSON.stringify(testw))
        console.log(JSON.stringify(w))

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
