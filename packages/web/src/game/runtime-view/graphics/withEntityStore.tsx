import { EntityStore } from "../../../../../runtime-framework/src/EntityStore"
import { EntityWith } from "../../../../../runtime-framework/src/NarrowProperties"
import { WebappComponents } from "../../runtime-extension/WebappComponents"
import { useEntitySet } from "../../runtime-extension/common/useEntitySet"

export function withEntityStore<T extends (keyof WebappComponents)[]>(
    Graphic: (props: { entity: EntityWith<WebappComponents, T[number]> }) => JSX.Element,
    ...components: [...T]
) {
    return function EntityGraphics(props: { store: EntityStore<WebappComponents> }) {
        const entities = useEntitySet<WebappComponents, T>(props.store, ...components)

        return (
            <>
                {entities.map(entity => (
                    <Graphic key={entity.id} entity={entity} />
                ))}
            </>
        )
    }
}
