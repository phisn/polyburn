import { Dialog } from "@headlessui/react"
import LZUtils from "lz-string"
import { useRef } from "react"

import useGlobalStore from "../../common/GlobalStore"
import { replaceWorld } from "../editor-store/MutationsForWorld"
import { useEditorStore } from "../editor-store/useEditorStore"

function ImportDialog(props: { isOpen: boolean, closeDialog: () => void }) {
    const mutate = useEditorStore(state => state.mutate)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const onImport = () => {
        if (!textareaRef.current) 
            return

        try {
            const worldJson = LZUtils.decompressFromBase64(textareaRef.current.value)
            const world = JSON.parse(worldJson)

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
                            Import world from base64
                        </Dialog.Title>

                        <textarea ref={textareaRef} spellCheck="false" placeholder="base64 world code" className="textarea textarea-bordered w-full h-32 resize-none scrollbar-none">
                        </textarea>

                        <div className="space-x-4">
                            <button className="btn" onClick={onImport}>
                                Import
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

export default ImportDialog
