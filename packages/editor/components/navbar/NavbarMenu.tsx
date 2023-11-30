import { Menu, Transition } from "@headlessui/react"
import { Fragment, useState } from "react"
import { BoxArrowInDownLeft } from "../../../../common/components/inline-svg/BoxArrowInDownLeft"
import { BoxArrowUpRightSvg } from "../../../../common/components/inline-svg/BoxArrowUpRight"
import { List } from "../../../../common/components/inline-svg/List"
import { ExportDialog } from "./ExportDialog"
import { ImportDialog } from "./ImportDialog"

export function NavbarMenu() {
    const [exportOpen, setExportOpen] = useState(false)
    const [importOpen, setImportOpen] = useState(false)

    return (
        <>
            <Menu as="div">
                <Menu.Button className="btn btn-square btn-ghost">
                    <List width="22" height="22" />
                </Menu.Button>

                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0"
                    enterTo="transform opacity-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100"
                    leaveTo="transform opacity-0"
                >
                    <Menu.Items
                        as="ul"
                        className="menu rounded-box dropdown-content bg-base-300 absolute mt-2 w-56 bg-opacity-70 backdrop-blur-2xl"
                    >
                        <Menu.Item as="li">
                            <button onClick={() => setImportOpen(true)}>
                                <BoxArrowInDownLeft width="16" height="16" />
                                Import
                            </button>
                        </Menu.Item>
                        <Menu.Item as="li">
                            <button onClick={() => setExportOpen(true)}>
                                <BoxArrowUpRightSvg width="16" height="16" />
                                Export
                            </button>
                        </Menu.Item>
                    </Menu.Items>
                </Transition>
            </Menu>

            <ExportDialog open={exportOpen} closeDialog={() => setExportOpen(false)} />
            <ImportDialog open={importOpen} closeDialog={() => setImportOpen(false)} />
        </>
    )
}
