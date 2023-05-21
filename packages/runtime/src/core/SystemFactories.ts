import { newCollisionEventListenerSystem } from "./common/systems/CollisionEventListenerSystem"
import { newRocketCollisionSystem } from "./rocket/systems/RocketCollisionSystem"
import { newRocketDeathSystem } from "./rocket/systems/RocketDeathSystem"
import { newRocketRotationSystem } from "./rocket/systems/RocketRotationSystem"
import { newRocketThrustSystem } from "./rocket/systems/RocketThrustSystem"
import { SystemFactory } from "./SystemFactory"

export const systemFactories: SystemFactory[] = [
    newCollisionEventListenerSystem,
    newRocketCollisionSystem,
    newRocketDeathSystem,
    newRocketRotationSystem,
    newRocketThrustSystem
]

/*
import { RuntimeStore } from "runtime-framework"

import { Components } from "../../Components"
import { Meta } from "../../Meta"
import { SystemContext } from "../SystemContext"

export const newSystem = (meta: Meta, store: RuntimeStore<SystemContext>) => {
    const rockets = store.newEntitySet(
        Components.Rocket,
        Components.Rigidbody)

}
*/