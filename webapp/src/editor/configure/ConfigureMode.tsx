import { filterEntitiesType as filterEntitiesTypeWithIndex } from "../../model/world/Entity"
import { EntityType } from "../../model/world/EntityType"
import { FlagEntity } from "../../model/world/Flag"
import { useEditorStore } from "../editor-store/useEditorStore"
import { Entity } from "./components/Entity"
import LevelCamera from "./components/LevelCamera"
import LevelCapture from "./components/LevelCapture"
import { Shape } from "./components/Shape"
import EventDispatcher from "./event/EventDispatcher"

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
    const cameras = filterEntitiesTypeWithIndex<FlagEntity>(entities, EntityType.RedFlag)
 
    return (
        <>
            {
                cameras.map(({ entity, index }) => 
                    <LevelCamera key={index} entity={entity} index={index} />
                )
            }

            {
                cameras.map(({ entity, index }) =>
                    <LevelCapture key={index} entity={entity} index={index} />
                )
            }
        </>
    )
}

export function ConfigureMode() {
    return (
        <>
            <EventDispatcher />

            <Entities />
            <Shapes />

            <Levels />
        </>
    )
}
