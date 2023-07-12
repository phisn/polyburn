import { compressToBase64 } from "lz-string"
import { useMemo, useState } from "react"
import { useMessage } from "runtime-framework"

import Dialog from "../../common/components/Dialog"
import useGlobalStore from "../../common/GlobalStore"
import { useGameStore } from "../store/GameStore"

export default function Replay() {
    const { store, messageStore } = useGameStore(state => state.systemContext)

    const [finished, setFinished] = useState(false)

    useMessage(messageStore, "finished", () => {
        setFinished(true)
    })

    const base64 = useMemo(() => {
        if (finished === false) return

        const world = store.world

        if (!world.has("world")) {
            useGlobalStore.getState().newAlert({
                type: "error",
                message: "Failed to export world",
            })

            return
        }

        return compressToBase64(JSON.stringify(world.components.world.replay))
    }, [finished, store])

    if (base64) {
        console.log(base64)
    }

    const onCopy = () => {
        if (base64) {
            navigator.clipboard.writeText(base64)

            useGlobalStore.getState().newAlert({
                type: "info",
                message: "Copied to clipboard",
            })
        }
    }

    return (
        <>
            {finished && (
                <Dialog open={finished} closeDialog={() => setFinished(false)}>
                    <div className="text-xl text-white">
                        Export world as base64
                    </div>

                    <textarea
                        readOnly
                        value={base64}
                        spellCheck="false"
                        rows={4}
                        className="textarea textarea-bordered scrollbar-none h-auto w-full resize-none"
                    ></textarea>

                    <div className="space-x-4">
                        <button className="btn" onClick={onCopy}>
                            Copy
                        </button>
                        <button
                            className="btn btn-ghost"
                            onClick={() => setFinished(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </Dialog>
            )}
        </>
    )
}
