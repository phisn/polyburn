import { Components } from "runtime/src/core/Components"
import { Meta } from "runtime/src/core/Meta"
import { SystemFactory } from "runtime/src/core/SystemFactory"
import { EntityStore } from "runtime-framework"
import { SystemContext } from "runtime/src/core/SystemContext"

export const newInterpolationSystem: SystemFactory = (meta: Meta, store: EntityStore) => {
    const entities = store.getState().newEntitySet(
        Components.Rigidbody)

    return (context) => {
        void 0
    }
}
