import { newCollisionEventListenerSystem } from "./collision/CollisionListenerSystem"
import { newRapierStepSystem } from "./common/systems/RapierStepSystem"
import { newLevelCaptureInProgressSystem } from "./level-capture/LevelCaptureInProgressSystem"
import { newLevelCaptureStartSystem } from "./level-capture/LevelCaptureStartSystem"
import { newRocketCollisionSystem } from "./rocket/systems/RocketCollisionSystem"
import { newRocketDeathSystem } from "./rocket/systems/RocketDeathSystem"
import { newRocketRotationSystem } from "./rocket/systems/RocketRotationSystem"
import { newRocketThrustSystem } from "./rocket/systems/RocketThrustSystem"
import { RuntimeSystemFactory } from "./RuntimeSystemFactory"
import { newWorldFinishSystem } from "./world/WorldFinishSystem"
import { newWorldTrackerSystem } from "./world/WorldTrackerSystem"

export const runtimeSystemFactories: RuntimeSystemFactory[] = [
    newRapierStepSystem,
    newWorldTrackerSystem,
    newWorldFinishSystem,

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
import { newWorldTrackerSystem } from './world/WorldTrackerSystem';
import { newWorldFinishSystem } from './world/WorldFinishSystem';

export const newSystem = (meta: Meta, store: RuntimeStore<SystemContext>) => {
    const rockets = store.newEntitySet(
        Components.RocketGraphic,
        Components.Rigidbody)

}
*/