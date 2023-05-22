import { Meta } from "../../Meta"
import { SystemFactory } from "../../SystemFactory"

export const newRapierStepSystem: SystemFactory = (meta: Meta) => {
    return () => meta.rapier.step(meta.queue)
}
