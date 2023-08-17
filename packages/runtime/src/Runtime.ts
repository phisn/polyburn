import RAPIER from "@dimforge/rapier2d-compat"

import { SystemStack, createEntityStore } from "../../runtime-framework/src"
import { createMessageStore } from "../../runtime-framework/src/MessageStore"
import { WorldModel } from "../proto/world"
import { RuntimeComponents } from "./core/RuntimeComponents"
import { defaultConfig } from "./core/RuntimeConfig"
import { RuntimeFactoryContext } from "./core/RuntimeFactoryContext"
import { runtimeSystemFactories } from "./core/RuntimeSystemFactories"
import { RuntimeSystemContext } from "./core/RuntimeSystemStack"
import { newLevel } from "./core/level/LevelFactory"
import { newRocket } from "./core/rocket/RocketFactory"
import { newShape } from "./core/shape/ShapeFactory"
import { filterForType } from "./model/EntityModel"

export const newRuntime = <Components extends RuntimeComponents>(
    gamemodeName: string,
    world: WorldModel,
) => {
    const gamemode = world.gamemodes.find(gamemode => gamemode.name === gamemodeName)

    if (gamemode === undefined) {
        throw new Error(`Gamemode ${gamemodeName} not found`)
    }

    const context: RuntimeFactoryContext<Components> = {
        store: createEntityStore(),
        messageStore: createMessageStore(),

        physics: new RAPIER.World(new RAPIER.Vector2(0, 0)),
        queue: new RAPIER.EventQueue(true),
        config: defaultConfig,
    }

    context.physics.gravity = new RAPIER.Vector2(0, -20)

    const entities = gamemode.groups.flatMap(group => world.groups[group])

    const rocketModel = entities.find(entity => entity.rocket)?.rocket

    if (rocketModel === undefined) {
        throw new Error("No rocket found in world")
    }

    const rocket = newRocket(context, rocketModel)

    rocket.components.rocket.currentLevel.components.level.boundsCollider.setSensor(false)
    rocket.components.rocket.currentLevel.components.level.captured = true
    rocket.components.rocket.currentLevel.components.level.hideFlag = true

    for (const level of filterForType(entities, "level")) {
        newLevel(context, level)
    }

    for (const shape of filterForType(entities, "shape")) {
        newShape(context, shape)
    }

    context.store.world.components.world = {
        replay: [],
        ticks: 0,
        finished: false,
    }

    return {
        context,
        stack: new SystemStack<RuntimeFactoryContext<RuntimeComponents>, RuntimeSystemContext>(
            context,
        ).add(...runtimeSystemFactories),
    }
}
