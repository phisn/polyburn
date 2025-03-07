import { Canvas as RawCanvas } from "@react-three/fiber"
import { useContext } from "react"
import { EditorStoreContext } from "../../store/store"
import { usePipelineEvent } from "./use-canvas-event"

export function Canvas() {
    const store = useContext(EditorStoreContext)

    if (store === undefined) {
        throw new Error("EditorStore not found")
    }

    // ;(store.resources.get("camera") as any).manual = false
    store.resources.get("camera").zoom = 20

    return (
        <RawCanvas camera={store.resources.get("camera")} scene={store.resources.get("scene")}>
            <PipelineEvent />
        </RawCanvas>
    )
}

function PipelineEvent() {
    const store = useContext(EditorStoreContext)

    if (store === undefined) {
        throw new Error("EditorStore not found")
    }

    usePipelineEvent(event => store.events.invoke.canvas?.(event))

    return <></>
}
