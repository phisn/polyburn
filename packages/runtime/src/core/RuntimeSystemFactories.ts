import { newCollisionEventListenerSystem } from "./common/systems/CollisionEventListenerSystem"
import { newRapierStepSystem } from "./common/systems/RapierStepSystem"
import { newLevelCaptureInProgressSystem } from "./level-capture/LevelCaptureInProgressSystem"
import { newLevelCaptureStartSystem } from "./level-capture/LevelCaptureStartSystem"
import { newRocketCollisionSystem } from "./rocket/systems/RocketCollisionSystem"
import { newRocketDeathSystem } from "./rocket/systems/RocketDeathSystem"
import { newRocketRotationSystem } from "./rocket/systems/RocketRotationSystem"
import { newRocketThrustSystem } from "./rocket/systems/RocketThrustSystem"
import { RuntimeSystemFactory } from "./RuntimeSystemFactory"
import { newWorldTickSystem } from "./world/WorldTickSystem"

export const runtimeSystemFactories: RuntimeSystemFactory[] = [
    newRapierStepSystem,
    newWorldTickSystem,

    newCollisionEventListenerSystem,

    newLevelCaptureInProgressSystem, // increase time before capture can start
    newLevelCaptureStartSystem,

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