import { EntityState } from "../../models/EntityState"
import { Mutation } from "../../store/EditorStore"

export const entityRemove = (state: EntityState): Mutation => {
    return {
        do(world) {
            world.entities.delete(state.id)
        },
        undo(world) {
            world.entities.set(state.id, state)
        },
    }
}
