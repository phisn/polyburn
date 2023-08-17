import { EntityModel } from "../../proto/world"

type NotUndefined<T> = T extends undefined ? never : T

export function filterForType<T extends keyof EntityModel>(entities: EntityModel[], type: T) {
    return entities
        .map(entity => entity[type])
        .filter((entity): entity is NotUndefined<EntityModel[T]> => entity !== undefined)
}
