import { Entity, EntityStore } from "runtime-framework"
import { useStore } from "zustand"

import { AddonComponents } from "../AddonComponents"
import { GraphicComponent } from "../graphic/GraphicComponent"

export default function EntityGraphics(props: { store: EntityStore }) {
    const entitiesMap = useStore(props.store, state => state.entities)

    const graphicEntities = [...entitiesMap.values()]
        .filter(entity => AddonComponents.Graphic in entity.components)

    return (
        <>
            {graphicEntities.map(entity => (
                <EntityGraphic key={entity.id} entity={entity} />
            ))}
        </>
    )
}

function EntityGraphic(props: { entity: Entity }) {
    const graphicComponent = props.entity.getSafe<GraphicComponent>(AddonComponents.Graphic)

    return (
        <>
            <graphicComponent.graphic entity={props.entity} />
        </>
    )
}
