import { RuntimeSystemFactory } from "../../RuntimeSystemFactory"

export const newRapierStepSystem: RuntimeSystemFactory = ({ physics, queue }) => 
    () => physics.step(queue)
