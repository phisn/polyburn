import { RocketEntityComponents } from "runtime/src/core/rocket/RocketEntity"

import { newParticleSourceComponent } from "../particle-source/ParticleSourceComponent"
import { WebappSystemFactory } from "../WebappSystemFactory"
import { newThrustParticleFactory } from "./ThrustParticleFactory"

export const newThrustParticleInjectSystem: WebappSystemFactory = (store) => {
    store.listenToEntities(
        (entity) => {
            entity.components.particleSource = newParticleSourceComponent(
                1000,
                newThrustParticleFactory(entity))
        },
        (entity) => {
            delete entity.components.particleSource
        },
        ...RocketEntityComponents)
}
