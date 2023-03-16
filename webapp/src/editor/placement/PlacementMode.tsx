import { editorModeTunnel } from "../Editor"
import { useEditorStore } from "../editor-store/useEditorStore"
import { Entity } from "./components/Entity"
import { EntityPreview } from "./components/EntityPreview"
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

function PlacementMode() {
    return (
        <>
            <EventDispatcher />
            <MousePointerHint /> 

            <Entities />
            <EntityPreview />
            <Shapes />

            <editorModeTunnel.In>
                <SideBar />
            </editorModeTunnel.In>
        </>
    )
}

export default PlacementMode
