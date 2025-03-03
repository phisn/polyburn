import { EntityWith } from "../framework/entity"
import { bytesToVertices, createShapeBody, ShapeVertex } from "../model/shape"
import { GameComponents, GameStore } from "../store"

export interface ShapeComponent {
    vertices: ShapeVertex[]
}

export const shapeComponents = ["shape"] satisfies (keyof GameComponents)[]

export type ShapeEntity<Components extends GameComponents = GameComponents> = EntityWith<
    Components,
    (typeof shapeComponents)[number]
>

export class ModuleShape {
    constructor(private store: GameStore) {}

    onReset() {
        for (const shape of this.store.entities.multipleCopy("shape")) {
            this.store.entities.remove(shape)
        }

        const config = this.store.resources.get("config")
        const rapier = this.store.resources.get("rapier")
        const world = this.store.resources.get("world")

        const groups = config.world.gamemodes[config.gamemode].groups.map(
            groupName => config.world.groups[groupName],
        )

        for (const shapeConfig of groups.flatMap(group => group.shapes)) {
            const vertices = bytesToVertices(rapier, shapeConfig.vertices)
            createShapeBody(rapier, world, vertices)

            this.store.entities.create({
                shape: { vertices },
            }) satisfies ShapeEntity
        }
    }
}
