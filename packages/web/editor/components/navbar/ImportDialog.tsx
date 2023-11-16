import { useRef } from "react"
import { Dialog } from "../../../../common/components/Dialog"
import { useAppStore } from "../../../../common/storage/app-store"
import { importModelString } from "../../models/import-model"
import { WorldState } from "../../models/world-state"
import { useEditorStore } from "../../store/EditorStore"

const replaceWorld = (newWorld: WorldState) => (world: WorldState) => {
    const gamemodes = world.gamemodes
    const entities = world.entities

    return {
        do() {
            world.gamemodes = newWorld.gamemodes
            world.entities = newWorld.entities
        },
        undo() {
            world.gamemodes = gamemodes
            world.entities = entities
        },
    }
}

export function ImportDialog(props: { open: boolean; closeDialog: () => void }) {
    const dispatch = useEditorStore(state => state.mutation)
    const textareaRef = useRef<HTMLTextAreaElement>(null!)

    const onImport = () => {
        try {
            const world = importModelString(textareaRef.current.value)

            dispatch(replaceWorld(world))

            /*
            useGlobalStore.getState().newAlert({
                type: "success",
                message: "Successfully imported world",
            })
            */

            props.closeDialog()
            console.log("imported world")
        } catch (e) {
            useAppStore.getState().newAlert({
                type: "error",
                message: "Failed to import world",
            })

            console.error(e)
        }
    }

    return (
        <Dialog {...props}>
            <div className="text-xl text-white">Import world from base64</div>

            <textarea
                ref={textareaRef}
                spellCheck="false"
                placeholder="base64 world code"
                className="textarea textarea-bordered scrollbar-none h-32 w-full resize-none"
            />

            <div className="space-x-4">
                <button className="btn btn-success" onClick={onImport}>
                    Import
                </button>
                <button className="btn btn-ghost" onClick={props.closeDialog}>
                    Cancel
                </button>
            </div>
        </Dialog>
    )
}
