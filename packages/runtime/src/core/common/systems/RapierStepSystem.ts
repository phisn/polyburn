import { RuntimeSystemFactory } from "../../RuntimeSystemFactory"

export const newRapierStepSystem: RuntimeSystemFactory = (_, meta) => {
    return () => meta.rapier.step(meta.queue)
}
