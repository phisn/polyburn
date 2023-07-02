import { RuntimeSystemFactory } from "../../RuntimeSystemFactory"

export const newRapierStepSystem: RuntimeSystemFactory = ({ rapier, queue }) => 
    () => rapier.step(queue)
