import { EntityStore, EntityWith } from "runtime-framework"
import { useEntitySet } from "../../../../common/hooks/use-entity-set"
import { EditorComponents } from "../editor-framework-base"

export function withEntityStore<T extends (keyof EditorComponents)[]>(
    Graphic: (props: { entity: EntityWith<EditorComponents, T[number]> }) => JSX.Element,
    ...components: [...T]
) {
    return function EntityGraphics(props: { store: EntityStore<EditorComponents> }) {
        const entities = useEntitySet<EditorComponents, T>(props.store, ...components)

        return (
            <>
                {entities.map(entity => (
                    <Graphic key={entity.id} entity={entity} />
                ))}
            </>
        )
    }
}
