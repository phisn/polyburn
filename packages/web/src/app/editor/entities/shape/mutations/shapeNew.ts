import { EntityType } from "runtime/src/core/common/EntityType"
import { Point } from "runtime/src/model/world/Point"
import { Vector2 } from "three"
import { WorldState } from "../../../models/WorldState"
import { ShapeState } from "../ShapeState"

export const shapeNew = (position: Point) => (world: WorldState) => {
    const id = [...world.entities.keys()].reduce((max, id) => Math.max(max, id), 0) + 1

    const shape: ShapeState = {
        type: EntityType.Shape,
        id,
        position,
        vertices: [
            {
                position: new Vector2(0, 0 + 2),
                color: { r: 255, g: 0, b: 0 },
            },
            {
                position: new Vector2(0 - 2, 0 - 2),
                color: { r: 255, g: 255, b: 255 },
            },
            {
                position: new Vector2(0 + 2, 0 - 2),
                color: { r: 255, g: 255, b: 255 },
            },
        ],
    }

    return {
        do() {
            world.entities.set(id, shape)
        },
        undo() {
            world.entities.delete(id)
        },
    }
}
