
import RAPIER from "@dimforge/rapier2d-compat"
import { expect, test } from "vitest"

import { RigidBodyComponent } from "../core/common/components/RigidBodyComponent"
import { Components } from "../core/Components"
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
                position: { x: -1, y: -1 },
                rotation: 0,
            }
        ]
    }

    const { store, stack } = newRuntime(commonGamemode, world)

    const rockets = store.getState().newEntitySet(Components.Rocket)
    const rocket = [...rockets][0]
    const rocketPosition = rocket.getSafe<RigidBodyComponent>(Components.RigidBody)

    for (let i = 0; i < 100; ++i) {
        const y = rocketPosition.body.translation().y
        stack.step({ rotation: i * 10, thrust: false })
        const newY = rocketPosition.body.translation().y

        expect(y).toBeGreaterThan(newY)
    }

    console.log(`entities: ${[...store.getState().entities].length}`)
})
