import { handleCollisionEvents } from "./handler/handleCollisionEvents"
import { handleRocketCollisions } from "./handler/handleRocketCollisions"
import { handleRocketRotation } from "./handler/handleRocketRotation"
import { handleRocketThrust } from "./handler/handleRocketThrust"
import { RuntimeState } from "./RuntimeState"
import { StepContext } from "./StepContext"

export type RuntimeHandler = (runtime: RuntimeState, context: StepContext) => void

export const runtimeHandlers: RuntimeHandler[] = [
    handleRocketRotation,
    handleRocketThrust,
    handleCollisionEvents,
    handleRocketCollisions
]

/*
import { RuntimeState } from "../RuntimeState"
import { StepContext } from "../StepContext"

export function (runtime: RuntimeState, context: UpdateContext): void {
    
}
*/
