import { OrthographicCamera } from "@react-three/drei"
import { Canvas as RawCanvas } from "@react-three/fiber"
import { EventHandler } from "./event/EventHandler"
import { Visual } from "./visual/Visual"

export function Canvas() {
    return (
        <RawCanvas frameloop="always">
            <EventHandler />
            <OrthographicCamera makeDefault zoom={50} far={100} near={-100} />
            <Visual />
        </RawCanvas>
    )
}

/*
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

*/
