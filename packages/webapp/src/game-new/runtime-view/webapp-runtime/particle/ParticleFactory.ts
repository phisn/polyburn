import RAPIER from "@dimforge/rapier2d-compat"
import { Meta } from "runtime/src/core/common/Meta"
import { EntityStore } from "runtime-framework"

import { ParticleGraphic } from "../../graphics/ParticleGraphic"
import { WebappComponents } from "../WebappComponents"
import { ParticleConfiguration } from "./ParticleConfiguration"

export const newParticle = (meta: Meta, store: EntityStore<WebappComponents>, config: ParticleConfiguration, offset = 0) => {
    // offset[0..1] explaination:
    //  we often want to spawn more than one particle per frame. when spawning more than one particle per frame we 
    //  would normally spawn all from the same position. this would result in a group of particles that are all
    //  clustered together and not look very good. because we can not actually move / spawn particles in between
    //  physic updates we simulate the movement of fractional physics updates by taking the amount of particles spawned
    //  per instance into account.

    const spawnPositionWithOffset = {
        // 0.017 was determined by trial and error. it is the amount of velocity applied per physics update.
        x: config.spawnPosition.x + config.spawnVelocity.x * offset * 0.017,
        y: config.spawnPosition.y + config.spawnVelocity.y * offset * 0.017,
    }

    const body = meta.rapier.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(spawnPositionWithOffset.x, spawnPositionWithOffset.y)
            .lockRotations()
            .setLinvel(config.spawnVelocity.x, config.spawnVelocity.y)
            .setAngularDamping(0.05)
            .setGravityScale(0))

    return store.getState().newEntity({
        particle: {
            size: config.size,
            age: 0,
            lifeTime: config.lifeTime,
            gradientOverTime: config.gradientOverTime,
        },
        moving: {},
        rigidBody: body,
        graphic: ParticleGraphic
    })
}
