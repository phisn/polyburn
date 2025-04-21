import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react"
import { saveAs } from "file-saver"
import { WorldConfig } from "game/proto/world"
import { bytesToBase64 } from "game/src/model/utils"
import { Fragment } from "react"
import { ArrowClockwise } from "../../../../components/common/svg/ArrowClockwise"
import { ArrowCounterClockwise } from "../../../../components/common/svg/ArrowCounterClockwise"
import { BoxArrowInDownLeft } from "../../../../components/common/svg/BoxArrowInDownLeft"
import { List } from "../../../../components/common/svg/List"
import { PlayFilled } from "../../../../components/common/svg/PlayFilled"
import { useEditorStore } from "../../store/store"
import { editorWorldToConfig } from "../../store/world"

export function Navbar() {
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
        const worldbytes = WorldConfig.encode(editorWorldToConfig(world)).finish()

        const bytes = await new Response(
            new ReadableStream({
                start(x) {
                    x.enqueue(worldbytes)
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

    async function onDownloadLegacy() {
        const world = useEditorStore.getState().world
        const worldbytes = WorldConfig.encode(editorWorldToConfig(world)).finish()

        saveAs(
            new Blob([bytesToBase64(worldbytes)], { type: "application/octet-stream" }),
            "world.leg-pbw",
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
                    <MenuItem as="li">
                        <button onClick={() => onDownloadLegacy()}>
                            <BoxArrowInDownLeft width="16" height="16" />
                            Download Legacy
                        </button>
                    </MenuItem>
                </MenuItems>
            </Transition>
        </Menu>
    )
}
