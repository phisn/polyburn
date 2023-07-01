import { EntityWith } from "runtime-framework/src/NarrowComponents"

import { EntityStore } from "../../../../../runtime-framework/src"
import { useEntitySet } from "../../../../../runtime-framework/src/useEntitySet"
import { WebappComponents } from "../webapp-runtime/WebappComponents"

export default function EntityGraphics(props: { store: EntityStore<WebappComponents> }) {
    const entities = useEntitySet(props.store, "graphic")

    return (
        <>
            {entities.map(entity => (
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
