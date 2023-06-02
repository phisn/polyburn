import RAPIER from "@dimforge/rapier2d-compat"
import { SystemStack } from "runtime-framework"

import { newShape } from "../core/common/ShapeFactory"
import { Meta } from "../core/Meta"
import { newRocket } from "../core/rocket/RocketFactory"
import { runtimeSystemFactories } from "../core/RuntimeSystemFactories"
import { RuntimeSystemContext } from "../core/RuntimeSystemStack"
import { RocketEntityModel } from "../model/world/EntityModel"
import { EntityModelType } from "../model/world/EntityModelType"
import { Gamemode } from "./Gamemode"

export const commonGamemode: Gamemode = (meta, store, world) => {
    meta.rapier.gravity = new RAPIER.Vector2(0, -20)

    const rocketModel = world.entities.find(entity => entity.type === EntityModelType.Rocket)

    if (rocketModel === undefined) {
        throw new Error("No rocket found in world")
    }

    newRocket(meta, store, rocketModel as RocketEntityModel)

    world.shapes.forEach(shape => {
        newShape(meta, store, shape)
    })

    return new SystemStack<Meta, RuntimeSystemContext>(store, meta).add(
        ...runtimeSystemFactories
    )
}
