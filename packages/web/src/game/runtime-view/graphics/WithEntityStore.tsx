import { EntityStore, EntityWith } from "runtime-framework"
import { useEntitySet } from "../../runtime-extension/common/use-entity-set"
import { WebappComponents } from "../../runtime-extension/webapp-components"

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
