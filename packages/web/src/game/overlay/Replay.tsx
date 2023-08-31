import { useMemo, useState } from "react"
import { useMessage } from "runtime-framework"

import { ReplayModel } from "runtime/proto/replay"
import { bytesToBase64 } from "../../app/editor/models/exportModel"
import useGlobalStore from "../../common/GlobalStore"
import Dialog from "../../common/components/Dialog"
import { trpc } from "../../common/trpc/trpc"
import { useGameStore } from "../store/GameStore"

export default function Replay() {
    const { store, messageStore, replayCaptureService } = useGameStore(state => state.systemContext)

    const [finished, setFinished] = useState(false)
    const validateReplay = trpc.validateReplay.useMutation()

    useMessage(messageStore, "finished", () => {
        setFinished(true)
        validateReplay.mutate({
            world: "",
            gamemode: "",
            replay: bytesToBase64(ReplayModel.encode(replayCaptureService.replay).finish()),
        })
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

        return bytesToBase64(ReplayModel.encode(replayCaptureService.replay).finish())
    }, [finished, store, replayCaptureService])

    if (base64) {
        console.log(base64)
    }

    const onCopy = () => {
        if (base64) {
            navigator.clipboard.writeText(base64).catch(console.error)

            useGlobalStore.getState().newAlert({
                type: "info",
                message: "Copied to clipboard",
            })
        }
    }

    return (
        <>
            <Dialog open={finished} closeDialog={() => setFinished(false)}>
                <div className="text-xl text-white">Export world as base64</div>

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
                    <button className="btn btn-ghost" onClick={() => setFinished(false)}>
                        Cancel
                    </button>
                </div>
            </Dialog>
        </>
    )
}
