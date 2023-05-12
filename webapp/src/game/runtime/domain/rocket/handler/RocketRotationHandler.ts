import { RuntimeState } from "../RuntimeState"
import { StepContext } from "../StepContext"

export function handleRocketRotation(runtime: RuntimeState, context: StepContext): void {
    if (runtime.rocket.collisionCount > 0) {
        return
    }

    runtime.rocket.body.setRotation(
        runtime.rocket.rotationNoInput + context.rotation,
        true
    )
}
