import { Components } from "runtime/src/core/Components"

import { FrameSystemFactory } from "../FrameSystem"

export const newInterpolationFrameSystem: FrameSystemFactory = (store) => {
    const entities = store.getState().newEntitySet(
        Components.Rigidbody)

    return () => {
        void 0
    }
}
