
import RAPIER from "@dimforge/rapier2d-compat"
import { createRuntimeStore } from "runtime-framework"
import { test } from "vitest"

import { Meta } from "../core/Meta"
import { SystemContext } from "../core/SystemContext"
import { EntityModelType } from "../model/world/EntityModelType"
import { WorldModel } from "../model/world/WorldModel"
import { commonGamemode } from "./CommonGamemode"

test("CommonGamemode", async () => {
    await RAPIER.init()

    const rapier = new RAPIER.World(new RAPIER.Vector2(0, 0))

    const meta: Meta = {
        rapier,
        queue: new RAPIER.EventQueue(true),
    }

    const store = createRuntimeStore<SystemContext>()

    const world: WorldModel = {
        shapes: [
            {
                vertices: [
                    { x: 0, y: 0 },
                    { x: 1, y: 0 },
                    { x: 1, y: 1 },
                ]
            }
        ],
        entities: [
            {
                type: EntityModelType.Rocket,
                position: { x: 0, y: 0 },
                rotation: 0,
            }
        ]
    }

    commonGamemode(meta, store.getState(), world)

    console.log(`entities: ${[...store.getState().entities].length}`)
})
