import { RigidbodyComponent } from "runtime/src/core/common/components/RigidbodyComponent"
import { Components } from "runtime/src/core/Components"
import { RuntimeSystemFactory } from "runtime/src/core/RuntimeSystemFactory"

import { AddonComponents } from "../AddonComponents"
import { InterpolationComponent } from "./InterpolationComponent"

export const newInjectInterpolationSystem: RuntimeSystemFactory = (store) => {
    store.getState().listenToEntities(
        (entity) => {
            const rigid = entity.getSafe<RigidbodyComponent>(Components.Rigidbody)

            entity.set<InterpolationComponent>(AddonComponents.Interpolation, {
                position: rigid.body.translation(),
                rotation: rigid.body.rotation()
            })
        },
        () => { void 0 },
        Components.Rigidbody)
}
