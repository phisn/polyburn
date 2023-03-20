import { Dialog } from "@headlessui/react"
import { useMemo } from "react"

import useGlobalStore from "../../common/GlobalStore"
import { useEditorStore } from "../editor-store/useEditorStore"
import { DialogType } from "./DialogType"

function ExportDialog() {
    const currentDialog = useEditorStore(state => state.dialogQueue.at(0))
    const closeDialog = useEditorStore(state => state.closeDialog)

    const isOpen = currentDialog === DialogType.Export

    const base64 = useMemo(() => {
        if (isOpen === false) {
            return
        }

        return btoa(JSON.stringify(useEditorStore.getState().world))
    }, [isOpen])

    const onCopy = () => {
        if (base64) {
            navigator.clipboard.writeText(base64)

            useGlobalStore.getState().newAlert({
                type: "info",
                message: "Copied to clipboard"
            })

            closeDialog()
        }
    }

    return (
        <Dialog
            open={isOpen} 
            onClose={() => closeDialog()}
            as="div"
            className="relative z-10">

            <div className="fixed inset-0 bg-black bg-opacity-50" />

            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-lg bg-base-100 p-6 rounded-xl space-y-4">
                        <Dialog.Title className="text-white text-xl">
                            Export world as base64
                        </Dialog.Title>

                        <textarea readOnly spellCheck="false" rows={4} className="textarea textarea-bordered w-full h-auto resize-none scrollbar-none">
                            {base64}
                        </textarea>

                        <div className="space-x-4">
                            <button className="btn" onClick={onCopy}>
                                Copy
                            </button>
                            <button className="btn btn-ghost" onClick={closeDialog}>
                                Cancel
                            </button>
                        </div>
                    </Dialog.Panel>
                </div>
            </div>
        </Dialog>
    )
}

export default ExportDialog
