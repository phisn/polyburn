import { Entity,EntityStore } from "runtime-framework"
import { useStore } from "zustand"

import { AddonComponents } from "./runtime-addon/AddonComponents"
import { GraphicComponent } from "./runtime-addon/graphic/GraphicComponent"

export default function Entities(props: { store: EntityStore }) {
    const entitiesMap = useStore(props.store, state => state.entities)

    const graphicEntities = [...entitiesMap.values()]
        .filter(entity => AddonComponents.Graphic in entity.components)

    return (
        <>
            {graphicEntities.map(entity => (
                <Entity key={entity.id} entity={entity} />
            ))}
        </>
    )
}

function Entity(props: { entity: Entity }) {
    const graphicComponent = props.entity.getSafe<GraphicComponent>(AddonComponents.Graphic)

    return (
        <>
            <graphicComponent.graphic entity={props.entity} />
        </>
    )
}
