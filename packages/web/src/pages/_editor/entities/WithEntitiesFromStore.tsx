import { EntityType } from "game/proto/world"
import { useEditorStore } from "../store/store"
import { ImmutableEntity } from "./entity"

export function withEntitiesFromStore<T extends EntityType>(
    type: T,
    EntityComponent: (props: { entity: ImmutableEntity & { type: T } }) => JSX.Element,
) {
    return function Entities() {
        const entities = useEditorStore(store =>
            [...store.world.entities]
                .map(([, entity]) => entity)
                .filter((entity): entity is ImmutableEntity & { type: T } => entity.type === type),
        )

        return (
            <>
                {entities.map(entity => (
                    <EntityComponent key={entity.id} entity={entity} />
                ))}
            </>
        )
    }
}
