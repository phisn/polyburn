
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

    const { store, stack } = newRuntime(commonGamemode, world)

    stack.step({ rotation: 0, thrust: false })

    console.log(`entities: ${[...store.getState().entities].length}`)
}) 

/*

runtime produces store, systemstack. the systemstack is the primary systemstack.
the webapp addon now takes the store and produces a new systemstack. the frame systemstaack.
now both systemstacks are updated at different times. at frame or tick rate. additionally we
create a visibleComponent that has the component used in it. it basicly finds it through
looking into the entity identity. if not we do not look into the addon identity because they
should already have the visible component. 

*/
