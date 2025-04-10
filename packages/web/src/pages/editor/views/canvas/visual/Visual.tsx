import { baseZoom } from "../../../constants"
import { useEditorStore } from "../../../store/store"
import { VisualRockets } from "./VisualRocket"
import { VisualShapes } from "./VisualShape"

export function Visual() {
    return (
        <>
            <HighlightPoint />
            <VisualRockets />
            <VisualShapes />
        </>
    )
}

function HighlightPoint() {
    const highlightPoint = useEditorStore(x => x.highlightPoint)

    if (highlightPoint) {
        return (
            <>
                <mesh position={[highlightPoint.point.x, highlightPoint.point.y, 1]}>
                    <circleGeometry args={[0.01 * baseZoom]} />
                    <meshBasicMaterial color={highlightPoint.color} />
                </mesh>
                <mesh position={[highlightPoint.point.x, highlightPoint.point.y, 0.5]}>
                    <circleGeometry args={[0.012 * baseZoom]} />
                    <meshBasicMaterial color={"#000000"} />
                </mesh>
            </>
        )
    }

    return undefined
}
