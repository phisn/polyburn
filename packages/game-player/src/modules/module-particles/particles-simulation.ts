import { Point } from "game/src/model/utils"
import { makeCCW, quickDecomp } from "poly-decomp-es"
import * as SAT from "sat"
import * as THREE from "three"
import { GamePlayerStore } from "../../model/store"
import { Environment, aabbFromCircle, newEnvironment } from "./particle-environment"
import {
    ParticleTemplate,
    ParticleTemplateInstance,
    resolveGradientColor,
} from "./particle-template"

export interface Particle {
    circle: SAT.Circle

    vx: number
    vy: number

    templateInstance: ParticleTemplateInstance
    age: number
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

    constructor(store: GamePlayerStore, shapes: Point[][]) {
        const geometry = new THREE.CircleGeometry(1, 32)
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff })

        this.particleMesh = new THREE.InstancedMesh(geometry, material, this.maxInstances)
        this.particleMesh.frustumCulled = false

        const scene = store.resources.get("scene")
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
                        decomp.map(([x, y]: any) => new SAT.Vector(x, y)),
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
                        dot *= 1 + particle.templateInstance.restitution

                        let accVelocityCandidateX = particle.vx - accNormalX * dot
                        let accVelocityCandidateY = particle.vy - accNormalY * dot

                        accVelocityCandidateX *= particle.templateInstance.friction
                        accVelocityCandidateY *= particle.templateInstance.friction

                        particle.vx = accVelocityCandidateX
                        particle.vy = accVelocityCandidateY
                    }
                }
            }

            if (i < this.maxInstances) {
                const shrinkModifier = Math.min(
                    1,
                    1 -
                        (particle.age / particle.templateInstance.lifetime -
                            particle.templateInstance.shrinkAfter) /
                            (1 - particle.templateInstance.shrinkAfter),
                )

                const minShrink = 1 - particle.templateInstance.maxShrink
                const shrink = particle.templateInstance.maxShrink + minShrink * shrinkModifier

                this.instanceMatrix.makeScale(
                    shrink * particle.circle.r,
                    shrink * particle.circle.r,
                    1,
                )
                this.instanceMatrix.setPosition(
                    particle.circle.pos.x,
                    particle.circle.pos.y,
                    -1 - (0.1 * particle.age) / particle.templateInstance.lifetime,
                )

                resolveGradientColor(
                    particle.templateInstance.gradient,
                    particle.age / particle.templateInstance.lifetime,
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
        const instance = template()

        // console.log("lifetime", instance.lifetime)

        const velocityWithoutSourceX = instance.velocity * Math.sin(instance.angle + sourceRotation)
        const velocityWithoutSourceY =
            instance.velocity * Math.cos(instance.angle + sourceRotation) * -1

        const offsetX = velocityWithoutSourceX * offsetIndex * 0.02
        const offsetY = velocityWithoutSourceY * offsetIndex * 0.02

        const velocityX = velocityWithoutSourceX + sourceVelocity.x * 0.7
        const velocityY = velocityWithoutSourceY + sourceVelocity.y * 0.3

        const particle: Particle = {
            circle: new SAT.Circle(
                new SAT.Vector(sourcePosition.x + offsetX, sourcePosition.y + offsetY),
                instance.size,
            ),
            vx: velocityX,
            vy: velocityY,
            templateInstance: instance,
            age: 0,
        }

        this.particles.push(particle)
    }

    private removeDeadParticles() {
        let removed = 0

        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (this.particles[i].age > this.particles[i].templateInstance.lifetime) {
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
