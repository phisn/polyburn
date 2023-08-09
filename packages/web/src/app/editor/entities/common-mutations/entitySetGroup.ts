import { EntityState } from "../../models/EntityState"

export function entitySetGroup(entity: EntityState, group: string | undefined) {
    const previous = entity.group

    return {
        do() {
            entity.group = group
        },
        undo() {
            entity.group = previous
        },
    }
}
