import { bytesToVertices, createShapeBody, ShapeVertex } from "../model/shape"
import { GameStore } from "../store"

export interface ShapeComponent {
    vertices: ShapeVertex[]
}

export class ModuleShape {
    constructor(private store: GameStore) {}

    onReset() {
        for (const shape of this.store.entities.multipleCopy("shape")) {
            this.store.entities.remove(shape)
        }

        const config = this.store.resources.get("config")
        const rapier = this.store.resources.get("rapier")
        const world = this.store.resources.get("world")

        for (const shapeConfig of config.shapes) {
            const vertices = bytesToVertices(rapier, shapeConfig.vertices)
            createShapeBody(rapier, world, vertices)

            this.store.entities.create({
                shape: { vertices },
            })
        }
    }
}
