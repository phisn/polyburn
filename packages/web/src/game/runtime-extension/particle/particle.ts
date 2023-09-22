import RAPIER from "@dimforge/rapier2d"

import { Gradient } from "./gradient"
import { ParticleSourceComponent } from "./particle-source"

export interface Particle {
    body: RAPIER.RigidBody

    size: number
    age: number
    lifeTime: number

    gradientOverTime: Gradient
}

export const spawnParticles = (
    particlePhysics: RAPIER.World,
    source: ParticleSourceComponent,
    amount = 1,
) => {
    for (let offset = 0; offset < amount; offset++) {
        const config = source.newConfig()

        // offset[0..1] explaination:
        //  we often want to spawn more than one particle per frame. when spawning more than one particle per frame we
        //  would normally spawn all from the same position. this would result in a group of particles that are all
        //  clustered together and not look very good. because we can not actually move / spawn particles in between
        //  physic updates we simulate the movement of fractional physics updates by taking the amount of particles spawned
        //  per instance into account.

        // 0.017 was determined by trial and error. it is the amount of velocity applied per physics update.
        const spawnPositionWithOffsetX =
            config.spawnPosition.x + config.spawnVelocity.x * (offset / amount) * 0.017
        const spawnPositionWithOffsetY =
            config.spawnPosition.y + config.spawnVelocity.y * (offset / amount) * 0.017

        const body = particlePhysics.createRigidBody(
            RAPIER.RigidBodyDesc.dynamic()
                .setTranslation(spawnPositionWithOffsetX, spawnPositionWithOffsetY)
                .lockRotations()
                .setLinvel(
                    config.spawnVelocity.x + config.additionalVelocity.x * 0.5,
                    config.spawnVelocity.y,
                )
                .setAngularDamping(0.05)
                .setGravityScale(0),
        )

        particlePhysics.createCollider(
            RAPIER.ColliderDesc.ball(config.size)
                .setCollisionGroups(0x0004_0002)
                .setRestitution(0.05)
                .setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Max)
                .setFriction(0)
                .setFrictionCombineRule(RAPIER.CoefficientCombineRule.Min),
            body,
        )

        const nextParticleIndex = (source.latestParticle + 1) % source.bufferAmount

        if (nextParticleIndex >= source.particles.length) {
            source.particles.push(undefined)
        }

        if (source.particles[nextParticleIndex] !== undefined) {
            removeParticle(particlePhysics, source, nextParticleIndex)
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

export const removeParticle = (
    particlePhysics: RAPIER.World,
    source: ParticleSourceComponent,
    index: number,
) => {
    const particle = source.particles[index]

    if (particle === undefined) {
        return
    }

    source.particles[index] = undefined
    --source.amount

    particlePhysics.removeRigidBody(particle.body)
}
