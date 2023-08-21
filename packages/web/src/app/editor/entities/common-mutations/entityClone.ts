import { EntityState } from "../../models/EntityState"
import { WorldState } from "../../models/WorldState"

export const entityClone = (entity: EntityState, group?: string) => (world: WorldState) => {
    const id = [...world.entities.keys()].reduce((max, id) => Math.max(max, id), 0) + 1
    const deepcopy = JSON.parse(JSON.stringify(entity))

    deepcopy.id = id
    deepcopy.group = group

    deepcopy.position.x += 1
    deepcopy.position.y += 1

    return {
        do() {
            world.entities.set(id, deepcopy)
        },
        undo() {
            world.entities.delete(id)
        },
    }
}
