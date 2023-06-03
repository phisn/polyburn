import { newCollisionEventListenerSystem } from "./common/systems/CollisionEventListenerSystem"
import { newRapierStepSystem } from "./common/systems/RapierStepSystem"
import { newRocketCollisionSystem } from "./rocket/systems/RocketCollisionSystem"
import { newRocketDeathSystem } from "./rocket/systems/RocketDeathSystem"
import { newRocketRotationSystem } from "./rocket/systems/RocketRotationSystem"
import { newRocketThrustSystem } from "./rocket/systems/RocketThrustSystem"
import { RuntimeSystemFactory } from "./RuntimeSystemFactory"

export const runtimeSystemFactories: RuntimeSystemFactory[] = [
    newRapierStepSystem,
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
        Components.RocketGraphic,
        Components.Rigidbody)

}
*/