import { RuntimeSystemContext } from "../core/RuntimeSystemStack"

interface Replay {
    contexts: RuntimeSystemContext[]

    // a validation point is a hash of some values in the simulation to ensure that the simulation by
    validationPoints: number[]
}
