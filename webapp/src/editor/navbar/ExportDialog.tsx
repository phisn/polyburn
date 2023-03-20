import { Dialog } from "@headlessui/react"
import LZString from "lz-string"
import { useMemo } from "react"

import useGlobalStore from "../../common/GlobalStore"
import { useEditorStore } from "../editor-store/useEditorStore"

function ExportDialog(props: { isOpen: boolean, closeDialog: () => void }) {

    const base64 = useMemo(() => {
        if (props.isOpen === false) {
            return
        }

        const toExport = "rw|" + JSON.stringify(useEditorStore.getState().world)
        
        return LZString.compressToBase64(toExport)
    }, [props.isOpen])

    const onCopy = () => {
        if (base64) {
            navigator.clipboard.writeText(base64)

            useGlobalStore.getState().newAlert({
                type: "info",
                message: "Copied to clipboard"
            })

            props.closeDialog()
        }
    }

    return (
        <Dialog
            open={props.isOpen} 
            onClose={() => props.closeDialog()}
            as="div"
            className="relative z-10">

            <div className="fixed inset-0 bg-black bg-opacity-50" />

            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-lg bg-base-100 p-6 rounded-xl space-y-4">
                        <Dialog.Title className="text-white text-xl">
                            Export world as base64
                        </Dialog.Title>

                        <textarea readOnly value={base64} spellCheck="false" rows={4} className="textarea textarea-bordered w-full h-auto resize-none scrollbar-none">
                        </textarea>

                        <div className="space-x-4">
                            <button className="btn" onClick={onCopy}>
                                Copy
                            </button>
                            <button className="btn btn-ghost" onClick={props.closeDialog}>
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
