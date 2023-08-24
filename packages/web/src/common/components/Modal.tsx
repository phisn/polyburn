import { Dialog as NativeDialog, Transition } from "@headlessui/react"
import { Fragment } from "react"

export function Modal(props: {
    open: boolean
    closeDialog: () => void
    children: React.ReactNode
}) {
    return (
        <Transition show={props.open} as={Fragment}>
            <NativeDialog onClose={() => props.closeDialog()} as="div" className="relative z-10">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-[2px]" />
                </Transition.Child>

                <div className="fixed inset-0 flex items-center justify-center p-4 py-8">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-200 translate transform"
                        enterFrom="opacity-0 translate-y-2"
                        enterTo="opacity-100 translate-y-0"
                        leave="ease-in duration-100"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-2"
                    >
                        <NativeDialog.Panel>{props.children}</NativeDialog.Panel>
                    </Transition.Child>
                </div>
            </NativeDialog>
        </Transition>
    )
}
