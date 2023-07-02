import RAPIER from "@dimforge/rapier2d-compat"
import { Meta } from "runtime/src/core/common/Meta"

import { SystemStack } from "../../../runtime-framework/src"
import { newLevel } from "../core/level/LevelFactory"
import { newRocket } from "../core/rocket/RocketFactory"
import { RuntimeComponents } from "../core/RuntimeComponents"
import { runtimeSystemFactories } from "../core/RuntimeSystemFactories"
import { RuntimeSystemContext } from "../core/RuntimeSystemStack"
import { newShape } from "../core/shape/ShapeFactory"
import { RocketEntityModel } from "../model/world/EntityModel"
import { EntityModelType } from "../model/world/EntityModelType"
import { FlagEntityModel } from "../model/world/FlagEntityModel"
import { Gamemode } from "./Gamemode"

export const commonGamemode: Gamemode = (meta, store, world) => {
    meta.rapier.gravity = new RAPIER.Vector2(0, -20)

    const rocketModel = world.entities.find(entity => entity.type === EntityModelType.Rocket)

    if (rocketModel === undefined) {
        throw new Error("No rocket found in world")
    }

    world.entities
        .filter((entity): entity is FlagEntityModel => entity.type === EntityModelType.RedFlag)
        .forEach(entity => {
            newLevel(meta, store, entity)
        })

    const rocket = newRocket(meta, store, rocketModel as RocketEntityModel)

    rocket.components.rocket.currentLevel.components.level.boundsCollider.setSensor(false)
    rocket.components.rocket.currentLevel.components.level.captured = true
    rocket.components.rocket.currentLevel.components.level.hideFlag = true

    world.shapes.forEach(shape => {
        newShape(meta, store, shape)
    })

    store.world.components.world = {
        ticks: 0,
        finished: false
    }

    return new SystemStack<RuntimeComponents, Meta, RuntimeSystemContext>(store, meta).add(
        ...runtimeSystemFactories,
        () => {
            const levels = store.newEntitySet("level")

            return () => {
                if (store.world.has("world") && store.world.components.world.finished === false) {
                    for (const level of levels) {
                        if (level.components.level.captured === false) {
                            return
                        }
                    }

                    console.log("Finished")
                    store.world.components.world.finished = true
                }
            }
        }
    )
}
