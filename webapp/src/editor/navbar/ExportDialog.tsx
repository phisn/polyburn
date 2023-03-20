import LZString from "lz-string"
import { useMemo } from "react"

import Dialog from "../../common/components/Dialog"
import useGlobalStore from "../../common/GlobalStore"
import { useEditorStore } from "../editor-store/useEditorStore"

function ExportDialog(props: { open: boolean, closeDialog: () => void }) {

    const base64 = useMemo(() => {
        if (props.open === false) {
            return
        }

        const toExport = "rw|" + JSON.stringify(useEditorStore.getState().world)

        return LZString.compressToBase64(toExport)
    }, [props.open])

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
        <Dialog {...props}>
            <div className="text-white text-xl">
                Export world as base64
            </div>

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
        </Dialog>
    )
}

export default ExportDialog
