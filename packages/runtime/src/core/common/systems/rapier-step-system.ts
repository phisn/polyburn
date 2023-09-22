import { RuntimeSystemFactory } from "../../runtime-system-factory"

export const newRapierStepSystem: RuntimeSystemFactory =
    ({ physics, queue }) =>
    () =>
        physics.step(queue)
