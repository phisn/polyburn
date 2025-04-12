import { Immutable } from "immer"
import { baseZoom } from "../../../constants"
import { useEditorStore } from "../../../store/store"
import { EditorEntity } from "../../../store/world"
import { VisualRocket } from "./VisualRocket"
import { VisualShape } from "./VisualShape"

export function Visual() {
    const world = useEditorStore(x => x.world)

    const selectedGamemode = useEditorStore(x => x.selectedGamemode)
    const selectedGroup = useEditorStore(x => x.selectedGroup)

    return (
        <>
            {Object.keys(world.entities)
                .map(key => [key, world.entities[key]] as const)
                .filter(
                    ([_, entity]) =>
                        selectedGamemode === undefined ||
                        entity.group === undefined ||
                        world.gamemodes[selectedGamemode].groups.includes(entity.group ?? ""),
                )
                .filter(
                    ([_, entity]) =>
                        selectedGroup === undefined || (entity.group ?? "") === selectedGroup,
                )
                .map(([entityKey, entity]) => (
                    <VisualEntity key={entityKey} entityKey={entityKey} entity={entity} />
                ))}
            <HighlightPoint />
        </>
    )
}

function VisualEntity(props: { entityKey: string; entity: Immutable<EditorEntity> }) {
    switch (props.entity.type) {
        case "flag":
            return <></>
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
