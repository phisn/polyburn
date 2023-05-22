import RAPIER from "@dimforge/rapier2d-compat"

import { newShape } from "../core/common/ShapeFactory"
import { newRocket } from "../core/rocket/RocketFactory"
import { systemFactories } from "../core/SystemFactories"
import { RocketEntityModel } from "../model/world/EntityModel"
import { EntityModelType } from "../model/world/EntityModelType"
import { Gamemode } from "./Gamemode"

export const commonGamemode: Gamemode = (meta, store, world) => {
    meta.rapier.gravity = new RAPIER.Vector2(0, -20)

    store.getState().addSystem(
        ...systemFactories.map(factory => factory(meta, store))
    )

    const rocketModel = world.entities.find(entity => entity.type === EntityModelType.Rocket)

    if (rocketModel === undefined) {
        throw new Error("No rocket found in world")
    }

    newRocket(meta, store, rocketModel as RocketEntityModel)

    world.shapes.forEach(shape => {
        newShape(meta, store, shape)
    })

    return store
}
