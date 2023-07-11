import RAPIER from "@dimforge/rapier2d-compat"

import { SystemStack } from "runtime-framework"
import { RuntimeComponents } from "../core/RuntimeComponents"
import { RuntimeFactoryContext } from "../core/RuntimeFactoryContext"
import { runtimeSystemFactories } from "../core/RuntimeSystemFactories"
import { RuntimeSystemContext } from "../core/RuntimeSystemStack"
import { EntityType } from "../core/common/EntityType"
import { newLevel } from "../core/level/LevelFactory"
import { newRocket } from "../core/rocket/RocketFactory"
import { newShape } from "../core/shape/ShapeFactory"
import { RocketEntityModel } from "../model/world/EntityModel"
import { FlagEntityModel } from "../model/world/FlagEntityModel"
import { Gamemode } from "./Gamemode"

export const commonGamemode: Gamemode = (context, world) => {
    context.physics.gravity = new RAPIER.Vector2(0, -20)

    const rocketModel = world.entities.find(
        entity => entity.type === EntityType.Rocket,
    )

    if (rocketModel === undefined) {
        throw new Error("No rocket found in world")
    }

    world.entities
        .filter(
            (entity): entity is FlagEntityModel =>
                entity.type === EntityType.Level,
        )
        .forEach(entity => {
            newLevel(context, entity)
        })

    const rocket = newRocket(context, rocketModel as RocketEntityModel)

    rocket.components.rocket.currentLevel.components.level.boundsCollider.setSensor(
        false,
    )
    rocket.components.rocket.currentLevel.components.level.captured = true
    rocket.components.rocket.currentLevel.components.level.hideFlag = true

    world.shapes.forEach(shape => {
        newShape(context, shape)
    })

    context.store.world.components.world = {
        replay: [],
        ticks: 0,
        finished: false,
    }

    return new SystemStack<
        RuntimeFactoryContext<RuntimeComponents>,
        RuntimeSystemContext
    >(context).add(...runtimeSystemFactories)
}
