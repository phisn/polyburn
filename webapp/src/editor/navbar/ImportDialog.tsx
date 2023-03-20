import LZUtils from "lz-string"
import { useRef } from "react"

import Dialog from "../../common/components/Dialog"
import useGlobalStore from "../../common/GlobalStore"
import { replaceWorld } from "../editor-store/MutationsForWorld"
import { useEditorStore } from "../editor-store/useEditorStore"

function ImportDialog(props: { open: boolean, closeDialog: () => void }) {
    const mutate = useEditorStore(state => state.mutate)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const onImport = () => {
        if (!textareaRef.current) 
            return

        try {
            const worldJson = LZUtils.decompressFromBase64(textareaRef.current.value)

            if (!worldJson) {
                throw new Error("Emtpy world code")
            }

            if (worldJson.startsWith("rw|") === false) {
                throw new Error("Invalid world signature")
            }

            const world = JSON.parse(worldJson.substring(3))

            mutate(replaceWorld(world))

            useEditorStore.setState({
                world: world
            })

            props.closeDialog()
        }
        catch (e) {
            useGlobalStore.getState().newAlert({
                type: "error",
                message: "Failed to import world"
            })

            console.error(e)
        }
    }

    return (
        <Dialog {...props}>
            <div className="text-white text-xl">
                Import world from base64
            </div>

            <textarea ref={textareaRef} spellCheck="false" placeholder="base64 world code" className="textarea textarea-bordered w-full h-32 resize-none scrollbar-none" />

            <div className="space-x-4">
                <button className="btn" onClick={onImport}>
                    Import
                </button>
                <button className="btn btn-ghost" onClick={props.closeDialog}>
                    Cancel
                </button>
            </div>
        </Dialog>
    )
}

export default ImportDialog
