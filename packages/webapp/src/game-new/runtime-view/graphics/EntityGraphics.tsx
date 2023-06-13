import { EntityWith } from "runtime-framework/src/NarrowComponents"
import { useStore } from "zustand"

import { EntityStore } from "../../../../../runtime-framework/src"
import { WebappComponents } from "../webapp-runtime/WebappComponents"

export default function EntityGraphics(props: { store: EntityStore<WebappComponents> }) {
    const entitiesMap = useStore(props.store, state => state.entities)

    const graphicEntities = [...entitiesMap.values()]
        .filter((entity): entity is EntityWith<WebappComponents, "graphic"> => entity.has("graphic"))

    return (
        <>
            {graphicEntities.map(entity => (
                <EntityGraphic key={entity.id} entity={entity} />
            ))}
        </>
    )
}

function EntityGraphic(props: { entity: EntityWith<WebappComponents, "graphic"> }) {
    return (
        <>
            <props.entity.components.graphic entity={props.entity} />
        </>
    )
}
