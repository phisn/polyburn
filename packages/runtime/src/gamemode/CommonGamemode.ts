import { newShape } from "../core/common/factories/ShapeFactory"
import { newRocket } from "../core/rocket/RocketFactory"
import { systemFactories } from "../core/SystemFactories"
import { RocketEntityModel } from "../model/world/EntityModel"
import { EntityType } from "../model/world/EntityType"
import { Gamemode } from "./Gamemode"

export const commonGamemode: Gamemode = (meta, store, world) => {
    store.addSystem(
        ...systemFactories.map(factory => factory(meta, store))
    )

    const rocketModel = world.entities.find(entity => entity.type === EntityType.Rocket)

    if (rocketModel === undefined) {
        throw new Error("No rocket found in world")
    }

    newRocket(meta, store, rocketModel as RocketEntityModel)

    world.entities.forEach(entity => {
        newShape(meta, store, entity)
    })
}
