import { FlagEntity } from "../../model/world/Entity"
import { EntityType } from "../../model/world/EntityType"
import { editorModeTunnel } from "../Editor"
import { useEditorStore } from "../editor-store/useEditorStore"
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


function LevelCameras() {
    const entities = useEditorStore(state => state.world.entities)

    const cameras = entities.filter(
        entity => entity.type === EntityType.RedFlag) as FlagEntity[]

    return (
        <>
            {
                cameras.map((camera, i) => <LevelCamera key={i} entity={camera} />)
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

            <LevelCameras />

            <editorModeTunnel.In>
                <SideBar />
            </editorModeTunnel.In>
        </>
    )
}

export default PlacementMode
