import { Immutable } from "immer"
import { baseZoom } from "../../../constants"
import { useEditorStore } from "../../../store/store"
import { EditorEntity } from "../../../store/world"
import { VisualGravitation } from "./VisualGravitation"
import { VisualLevel } from "./VisualLevel"
import { VisualRocket } from "./VisualRocket"
import { VisualShape } from "./VisualShape"

export function Visual() {
    const world = useEditorStore(x => x.world)

    return (
        <>
            {Object.keys(world.entities)
                .map(key => [key, world.entities[key]] as const)
                .map(([entityKey, entity]) => (
                    <VisualEntity key={entityKey} entityKey={entityKey} entity={entity} />
                ))}
            <HighlightPoint />
        </>
    )
}

function VisualEntity(props: { entityKey: string; entity: Immutable<EditorEntity> }) {
    const isEntityActive = useEditorStore(x => x.isEntityActive(props.entity))

    if (!isEntityActive) {
        return
    }

    switch (props.entity.type) {
        case "flag":
            return <VisualLevel entityKey={props.entityKey} entity={props.entity} />
        case "gravitation":
            return <VisualGravitation entityKey={props.entityKey} entity={props.entity} />
        case "rocket":
            return <VisualRocket entityKey={props.entityKey} entity={props.entity} />
        case "shape":
            return <VisualShape entityKey={props.entityKey} entity={props.entity} />
    }
}

function HighlightPoint() {
    const highlightPoint = useEditorStore(x => x.highlightPoint)

    if (highlightPoint) {
        return (
            <>
                <mesh position={[highlightPoint.x, highlightPoint.y, 1]}>
                    <circleGeometry args={[0.01 * baseZoom]} />
                    <meshBasicMaterial color={highlightPoint.color} />
                </mesh>
                <mesh position={[highlightPoint.x, highlightPoint.y, 0.5]}>
                    <circleGeometry args={[0.012 * baseZoom]} />
                    <meshBasicMaterial color={"#000000"} />
                </mesh>
            </>
        )
    }

    return undefined
}
