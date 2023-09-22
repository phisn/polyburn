import { Vector3 } from "three"

import { WebappSystemFactory } from "../webapp-system-factory"

export const newInjectInterpolationSystem: WebappSystemFactory = ({ store }) => {
    store.listenTo(
        entity => {
            const position = entity.components.rigidBody.translation()
            const rotation = entity.components.rigidBody.rotation()

            entity.components.interpolation = {
                currentActive: () => entity.components.rigidBody.isSleeping() === false,
                currentTranslation: () => entity.components.rigidBody.translation(),
                currentRotation: () => entity.components.rigidBody.rotation(),

                position: new Vector3(position.x, position.y),
                rotation,

                newPosition: new Vector3(position.x, position.y),
                newRotation: rotation,

                previousPosition: new Vector3(position.x, position.y),
                previousRotation: rotation,
            }
        },
        entity => {
            delete entity.components.interpolation
        },
        "rigidBody",
        "moving",
    )
}
