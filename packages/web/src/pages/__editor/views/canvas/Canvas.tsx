import { Canvas as RawCanvas } from "@react-three/fiber"
import { Fragment, useContext } from "react"
import { useSnapshot } from "valtio"
import { baseZoom } from "../../constants"
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
            <HighlightPoints />
            <PipelineEvent />
        </RawCanvas>
    )
}

function HighlightPoints() {
    const store = useContext(EditorStoreContext)

    if (store === undefined) {
        throw new Error("EditorStore not found")
    }

    const focus = useSnapshot(store.resources.get("focus"))

    return (
        <>
            {focus.highlightPoints.map((x, i) => (
                <Fragment key={i}>
                    <mesh position={[x.point.x, x.point.y, 1]}>
                        <circleGeometry args={[0.016 * baseZoom]} />
                        <meshBasicMaterial color={x.color} />
                    </mesh>
                    <mesh position={[x.point.x, x.point.y, 0.5]}>
                        <circleGeometry args={[0.018 * baseZoom]} />
                        <meshBasicMaterial color={"#000000"} />
                    </mesh>
                </Fragment>
            ))}
        </>
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
