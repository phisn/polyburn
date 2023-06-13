import { Vector3 } from "three"

import { WebappSystemFactory } from "../../WebappSystemFactory"

export const newInjectInterpolationSystem: WebappSystemFactory = (store) => {
    store.getState().listenToEntities(
        (entity) => {
            const position = entity.components.rigidBody.translation()
            const rotation = entity.components.rigidBody.rotation()

            entity.components.interpolation = {
                position: new Vector3(position.x, position.y),
                rotation,

                newPosition: new Vector3(position.x, position.y),
                newRotation: rotation,

                previousPosition: new Vector3(position.x, position.y),
                previousRotation: rotation,
            }
        },
        undefined,
        "rigidBody",
        "moving")
}
