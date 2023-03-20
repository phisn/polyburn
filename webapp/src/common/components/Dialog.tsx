import { Dialog as NativeDialog, Transition } from "@headlessui/react"
import { Fragment } from "react"

interface DialogProps {
    open: boolean
    closeDialog: () => void
    children: React.ReactNode
}

function Dialog(props: DialogProps) {
    return (
        <Transition show={props.open} as={Fragment}>
            <NativeDialog
                onClose={() => props.closeDialog()}
                as="div"
                className="relative z-10">

                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-100"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <NativeDialog.Panel className="w-full max-w-lg bg-base-100 p-6 rounded-xl space-y-4">
                                { props.children }
                            </NativeDialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </NativeDialog>
        </Transition>
    )
}

export default Dialog
