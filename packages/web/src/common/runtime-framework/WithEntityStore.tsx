import { EntityStore, EntityWith } from "runtime-framework"
import { useEntitySet } from "./use-entity-set"

export function withEntityStore<C extends object, T extends (keyof C)[]>(
    Component: (props: { entity: EntityWith<C, T[number]> }) => JSX.Element,
    ...components: [...T]
) {
    return function EntityComponent(props: { store: EntityStore<C> }) {
        const entities = useEntitySet<C, T>(props.store, ...components)

        return (
            <>
                {entities.map(entity => (
                    <Component key={entity.id} entity={entity} />
                ))}
            </>
        )
    }
}
