
import { useEditorStore } from "../editor-store/useEditorStore"
import { Shape } from "./components/Shape"
import EventDispatcher from "./event/EventDispatcher"

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

export function ConfigureMode() {
    return (
        <>
            <EventDispatcher />

            <Shapes />
        </>
    )
}
