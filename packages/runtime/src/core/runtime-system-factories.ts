import { newCollisionEventListenerSystem } from "./collision/collision-listener-system"
import { newRapierStepSystem } from "./common/systems/rapier-step-system"
import { newLevelCaptureInProgressSystem } from "./level-capture/level-capture-in-progress-system"
import { newLevelCaptureStartSystem } from "./level-capture/level-capture-start-system"
import { newRocketCollisionSystem } from "./rocket/systems/rocket-collision-system"
import { newRocketDeathSystem } from "./rocket/systems/rocket-death-system"
import { newRocketRotationSystem } from "./rocket/systems/rocket-rotation-system"
import { newRocketThrustSystem } from "./rocket/systems/rocket-thrust-system"
import { RuntimeSystemFactory } from "./runtime-system-factory"
import { newWorldFinishSystem } from "./world/world-finish-system"
import { newWorldTrackerSystem } from "./world/world-tracker-system"

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
    newRocketThrustSystem,
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
