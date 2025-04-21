import { Dialog } from "../../../../common/components/Dialog"
import { useGlobalStore } from "../../../../common/store"

export function ExportDialog(props: { open: boolean; closeDialog: () => void }) {
    const newAlert = useGlobalStore(store => store.newAlert)

    const onCopy = () => {
        if (base64) {
            navigator.clipboard.writeText(base64).catch(console.error)

            newAlert({
                type: "info",
                message: "Copied to clipboard",
            })

            props.closeDialog()
        }
    }

    return (
        <Dialog {...props}>
            <div className="text-xl text-white">Export world as base64</div>

            <textarea
                readOnly
                value={base64}
                spellCheck="false"
                rows={4}
                className="textarea textarea-bordered scrollbar-none h-auto w-full resize-none"
            ></textarea>

            <div className="space-x-4">
                <button className="btn btn-success" onClick={onCopy}>
                    Copy
                </button>
                <button className="btn btn-ghost" onClick={props.closeDialog}>
                    Cancel
                </button>
            </div>
        </Dialog>
    )
}
