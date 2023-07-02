import RAPIER from "@dimforge/rapier2d-compat"

import { Meta } from "../../../../../../runtime/src/core/common/Meta"
import { Gradient } from "./Gradient"
import { ParticleSourceComponent } from "./ParticleSourceComponent"

export interface Particle {
    body: RAPIER.RigidBody

    size: number
    age: number
    lifeTime: number

    gradientOverTime: Gradient
}

export const spawnParticles = (meta: Meta, source: ParticleSourceComponent, amount = 1) => {
    for (let offset = 0; offset < amount; offset++) {
        const config = source.newConfig()

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

        meta.rapier.createCollider(
            RAPIER.ColliderDesc.ball(config.size)
                .setCollisionGroups(0x0004_0002)
                .setRestitution(0.05)
                .setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Max)
                .setFriction(0)
                .setFrictionCombineRule(RAPIER.CoefficientCombineRule.Min),
            body
        )

        const nextParticleIndex = (source.latestParticle + 1) % source.bufferAmount 

        if (nextParticleIndex >= source.particles.length) {
            source.particles.push(undefined)
        }

        if (source.particles[nextParticleIndex] !== undefined) {
            removeParticle(meta, source, nextParticleIndex)
        }

        source.particles[nextParticleIndex] = {
            body,

            size: config.size,
            age: 0,
            lifeTime: config.lifeTime,

            gradientOverTime: config.gradientOverTime,
        }
 
        ++source.amount
        source.latestParticle = nextParticleIndex
    }
}

export const removeParticle = (meta: Meta, source: ParticleSourceComponent, index: number) => {
    const particle = source.particles[index]

    if (particle === undefined) {
        return
    }

    source.particles[index] = undefined
    --source.amount

    meta.rapier.removeRigidBody(particle.body)
}

