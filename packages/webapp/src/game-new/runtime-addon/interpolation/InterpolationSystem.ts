import { Components } from "runtime/src/core/Components"
import { Meta } from "runtime/src/core/Meta"
import { SystemFactory } from "runtime/src/core/SystemFactory"
import { RuntimeStore } from "runtime-framework"

export const newInterpolationSystem: SystemFactory = (meta: Meta, store: RuntimeStore) => {
    const entities = store.getState().newEntitySet(
        Components.Rigidbody
        #)
}
