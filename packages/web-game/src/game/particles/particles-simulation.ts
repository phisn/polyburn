import { Point } from "runtime/src/model/point"
import * as SAT from "sat"
import * as THREE from "three"

import { makeCCW, quickDecomp } from "poly-decomp-es"
import { Environment, aabbFromCircle, newEnvironment } from "./particle-environment"
import {
    ParticleGradient,
    ParticleTemplate,
    resolveGradientColor,
    resolveParticleProperty,
} from "./particle-template"

export interface Particle {
    circle: SAT.Circle

    vx: number
    vy: number

    friction: number
    restitution: number

    age: number
    lifetime: number

    gradient: ParticleGradient
}

export class ParticleSimulation {
    private particleMesh: THREE.InstancedMesh

    private polygons: SAT.Polygon[] = []
    private particles: Particle[] = []
    private environment: Environment

    private substeps = 4
    private collisionResponse = new SAT.Response()

    private instanceColor = new THREE.Color()
    private instanceMatrix = new THREE.Matrix4()
    private maxInstances = 2048

    constructor(scene: THREE.Scene, shapes: Point[][]) {
        const geometry = new THREE.CircleGeometry(1, 32)
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff })

        this.particleMesh = new THREE.InstancedMesh(geometry, material, this.maxInstances)
        this.particleMesh.frustumCulled = false

        scene.add(this.particleMesh)

        for (const shape of shapes) {
            const polygon = shape.map(p => [p.x, p.y] as [number, number])

            makeCCW(polygon)
            const decomps = quickDecomp(polygon)

            if (!decomps) {
                console.error("Failed to decompose polygon", polygon)
                throw new Error("Failed to decompose polygon")
            }

            for (const decomp of decomps) {
                this.polygons.push(
                    new SAT.Polygon(
                        new SAT.Vector(0, 0),
                        decomp.map(([x, y]) => new SAT.Vector(x, y)),
                    ),
                )
            }
        }

        this.environment = newEnvironment(this.polygons)
    }

    onUpdate(delta: number) {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].age += delta
        }

        this.removeDeadParticles()

        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i]

            for (let i = 0; i < this.substeps; i++) {
                const dx = (particle.vx * delta) / 1000 / this.substeps
                const dy = (particle.vy * delta) / 1000 / this.substeps

                particle.circle.pos.x = particle.circle.pos.x + dx
                particle.circle.pos.y = particle.circle.pos.y + dy

                let accNormalX = 0
                let accNormalY = 0
                let accNormalCount = 0

                const aabb = aabbFromCircle(particle.circle)
                const polygons = this.environment.query(aabb)

                for (const polygon of polygons) {
                    this.collisionResponse.clear()

                    const collided = SAT.testCirclePolygon(
                        particle.circle,
                        polygon,
                        this.collisionResponse,
                    )

                    if (collided) {
                        accNormalX += this.collisionResponse.overlapV.x
                        accNormalY += this.collisionResponse.overlapV.y

                        accNormalCount++
                    }
                }

                if (accNormalCount > 0) {
                    accNormalX /= accNormalCount
                    accNormalY /= accNormalCount

                    const accNormalLength = Math.sqrt(
                        accNormalX * accNormalX + accNormalY * accNormalY,
                    )

                    accNormalX /= accNormalLength
                    accNormalY /= accNormalLength

                    let dot = particle.vx * accNormalX + particle.vy * accNormalY

                    if (dot > 0) {
                        dot *= 1 + particle.restitution

                        let accVelocityCandidateX = particle.vx - accNormalX * dot
                        let accVelocityCandidateY = particle.vy - accNormalY * dot

                        accVelocityCandidateX *= particle.friction
                        accVelocityCandidateY *= particle.friction

                        particle.vx = accVelocityCandidateX
                        particle.vy = accVelocityCandidateY
                    }
                }
            }

            if (i < this.maxInstances) {
                this.instanceMatrix.makeScale(particle.circle.r, particle.circle.r, 1)
                this.instanceMatrix.setPosition(
                    particle.circle.pos.x,
                    particle.circle.pos.y,
                    -1 - (0.1 * particle.age) / particle.lifetime,
                )

                resolveGradientColor(
                    particle.gradient,
                    particle.age / particle.lifetime,
                    this.instanceColor,
                )

                this.particleMesh.setMatrixAt(i, this.instanceMatrix)
                this.particleMesh.setColorAt(i, this.instanceColor)
            }
        }

        this.particleMesh.instanceMatrix.needsUpdate = true
        if (this.particleMesh.instanceColor) this.particleMesh.instanceColor.needsUpdate = true
    }

    createParticle(
        template: ParticleTemplate,
        sourcePosition: Point,
        sourceRotation: number,
        sourceVelocity: Point,
        offsetIndex: number = 0,
    ) {
        const baseVelocity = resolveParticleProperty(template.velocity)
        const friction = resolveParticleProperty(template.friction)
        const restitution = resolveParticleProperty(template.restitution)

        const lifetime = resolveParticleProperty(template.lifetime)
        const size = resolveParticleProperty(template.size)
        const angle = resolveParticleProperty(template.angle)

        const velocityWithoutSourceX = baseVelocity * Math.sin(angle + sourceRotation)
        const velocityWithoutSourceY = baseVelocity * Math.cos(angle + sourceRotation) * -1

        const offsetX = velocityWithoutSourceX * offsetIndex * 0.02
        const offsetY = velocityWithoutSourceY * offsetIndex * 0.02

        const velocityX = velocityWithoutSourceX + sourceVelocity.x * 0.7
        const velocityY = velocityWithoutSourceY + sourceVelocity.y * 0.3

        const particle: Particle = {
            circle: new SAT.Circle(
                new SAT.Vector(sourcePosition.x + offsetX, sourcePosition.y + offsetY),
                size,
            ),
            vx: velocityX,
            vy: velocityY,
            friction,
            restitution,
            age: 0,
            lifetime,
            gradient: template.gradient,
        }

        this.particles.push(particle)
    }

    private removeDeadParticles() {
        let removed = 0

        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (this.particles[i].age > this.particles[i].lifetime) {
                const swapWith = this.particles.length - 1 - removed

                if (i !== swapWith) {
                    this.particles[i] = this.particles[swapWith]
                }

                removed++
            }
        }

        this.particles.length = this.particles.length - removed
        this.particleMesh.count = this.particles.length
    }
}
