import { EntityType } from "../../model/world/EntityType"
import { FlagEntity } from "../../model/world/Flag"
import { editorModeTunnel } from "../Editor"
import { useEditorStore } from "../store/useEditorStore"
import { Entity } from "./components/Entity"
import { EntityPreview } from "./components/EntityPreview"
import { LevelCamera } from "./components/LevelCamera"
import { MousePointerHint } from "./components/MousePointerHint"
import { Shape } from "./components/Shape"
import EventDispatcher from "./event/EventDispatcher"
import SideBar from "./SideBar"

function Entities() {
    const world = useEditorStore(state => state.world)

    return (
        <>
            {
                world.entities.map((entity, i) => <Entity key={i} entity={entity} index={i} /> )
            }
        </>
    )
}

function Shapes() {
    const world = useEditorStore(state => state.world)

    return (
        <>
            {
                world.shapes.map((_, i) => <Shape key={i} shapeIndex={i} /> )
            }
        </>
    )
}


function Levels() {
    const entities = useEditorStore(state => state.world.entities)

    const cameras = entities
        .map((entity, index) => ({ entity, index }))
        .filter(
            ({ entity }) => entity.type === EntityType.RedFlag
        ) as { entity: FlagEntity, index: number }[]

    return (
        <>
            {
                cameras.map((camera, i) => 
                    <LevelCamera key={i} entity={camera.entity} index={camera.index} />
                )
            }
        </>
    )
}

function PlacementMode() {
    return (
        <>
            <EventDispatcher />
            <MousePointerHint /> 

            <Entities />
            <EntityPreview />
            <Shapes />

            <Levels />

            <editorModeTunnel.In>
                <SideBar />
            </editorModeTunnel.In>
        </>
    )
}

export default PlacementMode
