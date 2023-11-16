import { exportShapeModel } from "../../models/export-model"
import { importShapeModel } from "../../models/import-model"
import { WorldState } from "../../models/world-state"
import { ShapeState } from "../shape/shape-state"

export const entityClone = (entity: ShapeState, group?: string) => (world: WorldState) => {
    const id = [...world.entities.keys()].reduce((max, id) => Math.max(max, id), 0) + 1

    const deepcopy = importShapeModel(id, group, exportShapeModel(entity))

    deepcopy.position.x += 2
    deepcopy.position.y -= 2

    return {
        do() {
            world.entities.set(id, deepcopy)
        },
        undo() {
            world.entities.delete(id)
        },
    }
}
