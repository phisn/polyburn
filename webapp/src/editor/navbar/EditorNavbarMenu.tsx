import { Menu, Transition } from "@headlessui/react"
import { Fragment, useState } from "react"

import ExportDialog from "./ExportDialog"
import ImportDialog from "./ImportDialog"

const MenuSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
)

const ImportSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="inline-block w-4 h-4">
        <path fillRule="evenodd" d="M9.636 2.5a.5.5 0 0 0-.5-.5H2.5A1.5 1.5 0 0 0 1 3.5v10A1.5 1.5 0 0 0 2.5 15h10a1.5 1.5 0 0 0 1.5-1.5V6.864a.5.5 0 0 0-1 0V13.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
        <path fillRule="evenodd" d="M5 10.5a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 0-1H6.707l8.147-8.146a.5.5 0 0 0-.708-.708L6 9.293V5.5a.5.5 0 0 0-1 0v5z"/>
    </svg>
)

const ExportSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="inline-block w-4 h-4">
        <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
        <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
    </svg>
)

export default function EditorNavbarMenu() {
    const [exportOpen, setExportOpen] = useState(false)
    const [importOpen, setImportOpen] = useState(false)

    return (
        <>
            <Menu as="div">
                <Menu.Button className="btn btn-square btn-ghost">
                    <MenuSvg />
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

                    <Menu.Items as="ul" className="absolute mt-2 menu bg-base-100 w-56 rounded-box dropdown-content">
                        <Menu.Item as="li">
                            <button onClick={() => setImportOpen(true)}>
                                <ImportSvg />
                                Import
                            </button>
                        </Menu.Item>
                        <Menu.Item as="li">
                            <button onClick={() => setExportOpen(true)}>
                                <ExportSvg />
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
