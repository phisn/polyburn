
import RAPIER from "@dimforge/rapier2d-compat"
import { test } from "vitest"

import { EntityModelType } from "../model/world/EntityModelType"
import { WorldModel } from "../model/world/WorldModel"
import { newRuntime } from "../Runtime"
import { commonGamemode } from "./CommonGamemode"

test("CommonGamemode", async () => {
    await RAPIER.init()

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

    const store = newRuntime(commonGamemode, world)

    store.getState().step({ rotation: 0, thrust: false })

    console.log(`entities: ${[...store.getState().entities].length}`)
})
