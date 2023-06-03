import { RigidbodyComponent } from "runtime/src/core/common/components/RigidbodyComponent"
import { Components } from "runtime/src/core/Components"
import { RuntimeSystemFactory } from "runtime/src/core/RuntimeSystemFactory"
import { Vector3 } from "three"

import { AddonComponents } from "../AddonComponents"
import { InterpolationComponent } from "./InterpolationComponent"

export const newInjectInterpolationSystem: RuntimeSystemFactory = (store) => {
    store.getState().listenToEntities(
        (entity) => {
            const rigid = entity.getSafe<RigidbodyComponent>(Components.Rigidbody)

            const position = rigid.body.translation()
            const rotation = rigid.body.rotation()

            entity.set<InterpolationComponent>(AddonComponents.Interpolation, {
                position: new Vector3(position.x, position.y),
                rotation,

                newPosition: new Vector3(position.x, position.y),
                newRotation: rotation,

                previousPosition: new Vector3(position.x, position.y),
                previousRotation: rotation,
            })
        },
        () => { void 0 },
        Components.Rigidbody,
        Components.Moving)
}
