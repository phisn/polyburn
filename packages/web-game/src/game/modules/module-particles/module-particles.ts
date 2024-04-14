import { EntityWith } from "runtime-framework"
import { EntityType } from "runtime/proto/world"
import { changeAnchor } from "runtime/src/model/world/change-anchor"
import { entityRegistry } from "runtime/src/model/world/entity-registry"
import { Color } from "three"
import { ExtendedComponents } from "../../runtime-extension/extended-components"
import { ExtendedRuntime } from "../../runtime-extension/new-extended-runtime"
import { ParticleTemplate } from "./particle-template"
import { ParticleSimulation } from "./particles-simulation"

const PARTICLE_TEMPLATE_THRUST: ParticleTemplate = {
    velocity: 15,
    friction: 0.8,
    restitution: 0.1,

    lifetime: { min: 0.36 * 1000, max: 0.63 * 1000 },
    size: { min: 0.3 * 0.75, max: 0.7 * 0.75 },
    angle: { min: -Math.PI / 16, max: Math.PI / 16 },
    gradient: [
        { time: 0.0, color: new Color().setRGB(1.0, 0.726, 0.0, "srgb") },
        { time: 0.2, color: new Color().setRGB(1.0, 0.618, 0.318, "srgb") },
        { time: 0.4, color: new Color().setRGB(1.0, 0.0, 0.0, "srgb") },
        { time: 0.65, color: new Color().setRGB(0.65, 0.65, 0.65, "srgb") },
        { time: 1.0, color: new Color().setRGB(0.311, 0.311, 0.311, "srgb") },
    ],
}

export class ModuleParticles {
    private simulation: ParticleSimulation
    private rocket: EntityWith<ExtendedComponents, "interpolation" | "rocket" | "rigidBody">
    private deltaSum = 0

    constructor(private runtime: ExtendedRuntime) {
        const shapes = runtime.factoryContext.store
            .find("shape")
            .map(x => x.components.shape.vertices.map(x => x.position))

        this.simulation = new ParticleSimulation(runtime, shapes)

        const [rocket] = runtime.factoryContext.store.find("rocket", "interpolation", "rigidBody")
        this.rocket = rocket
    }

    update(delta: number) {
        this.simulation.onUpdate(delta)

        if (this.rocket.components.rocket.thrusting) {
            this.deltaSum += delta

            for (let i = 0; this.deltaSum >= 16 / 3; ++i) {
                this.deltaSum -= 16 / 3

                const spawnPosition = changeAnchor(
                    this.rocket.components.interpolation.position,
                    this.rocket.components.interpolation.rotation,
                    entityRegistry[EntityType.ROCKET],
                    { x: 0.5, y: 0.5 },
                    { x: 0.5, y: 0.3 },
                )

                this.simulation.createParticle(
                    PARTICLE_TEMPLATE_THRUST,
                    spawnPosition,
                    this.rocket.components.interpolation.rotation,
                    this.rocket.components.rigidBody.linvel(),
                    i,
                )
            }
        } else {
            this.deltaSum = 0
        }
    }
}
