import { useMemo } from "react"
import { Dialog } from "../../../../common/components/Dialog"
import { useAppStore } from "../../../../common/storage/app-store"
import { exportModelString } from "../../models/export-model"
import { useEditorStore } from "../../store/EditorStore"

export function ExportDialog(props: { open: boolean; closeDialog: () => void }) {
    const world = useEditorStore(store => store.state).world

    const newAlert = useAppStore(store => store.newAlert)

    const base64 = useMemo(() => {
        if (props.open === false) {
            return
        }

        return exportModelString(world)
    }, [props.open, world])

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
