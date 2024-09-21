import { EntityType } from "runtime/proto/world"
import { RocketDeathMessage } from "runtime/src/core/rocket/rocket-death-message"
import { changeAnchor } from "runtime/src/model/world/change-anchor"
import { entityRegistry } from "runtime/src/model/world/entity-registry"
import { Color } from "three"
import { EntityWith, MessageCollector } from "../../../../../_runtime-framework/src"
import { ExtendedComponents } from "../../runtime-extension/extended-components"
import { ExtendedRuntime } from "../../runtime-extension/new-extended-runtime"
import {
    ParticleTemplate,
    downBias,
    randomBetween,
    randomBetweenDownBiased,
} from "./particle-template"
import { ParticleSimulation } from "./particles-simulation"

const PARTICLE_TEMPLATE_THRUST_GRADIENT = [
    { time: 0.0, color: new Color().setRGB(1.0, 0.726, 0.0, "srgb") },
    { time: 0.2, color: new Color().setRGB(1.0, 0.618, 0.318, "srgb") },
    { time: 0.4, color: new Color().setRGB(1.0, 0.0, 0.0, "srgb") },
    { time: 0.65, color: new Color().setRGB(0.65, 0.65, 0.65, "srgb") },
    { time: 1.0, color: new Color().setRGB(0.0, 0.0, 0.0, "srgb") },
]

const PARTICLE_TEMPLATE_THRUST: ParticleTemplate = () => {
    const angleRange = Math.PI / 16
    const angle = randomBetween(-angleRange, angleRange)

    // console.log("angle", 1 - Math.abs(angle / angleRange))
    const lifetimeBoost = 250 * downBias(1 - Math.abs(angle / angleRange), 0.3)

    return {
        velocity: 15,
        friction: 0.8,
        restitution: 0.1,

        lifetime: randomBetweenDownBiased(360, 630 + lifetimeBoost, 0.7),
        size: randomBetween(0.3 * 0.8, 0.7 * 0.8),
        angle,
        gradient: PARTICLE_TEMPLATE_THRUST_GRADIENT,

        shrinkAfter: 0.8,
        maxShrink: 0.75,
    }
}

const PARTICLE_TEMPLATE_DEATH: ParticleTemplate = () => ({
    velocity: randomBetweenDownBiased(3, 30, 1 / 3),
    friction: 0.8,
    restitution: 0.1,

    lifetime: randomBetween((15 / 60) * 1000, (120 / 60) * 1000),
    size: randomBetween(0.3 * 0.8, 0.7 * 0.8),
    angle: randomBetween(-Math.PI / 2, Math.PI / 2),
    gradient: [
        { time: 0.0, color: new Color().setRGB(1.0, 0.726, 0.0, "srgb") },
        { time: 0.2, color: new Color().setRGB(1.0, 0.618, 0.318, "srgb") },
        { time: 0.4, color: new Color().setRGB(1.0, 0.0, 0.0, "srgb") },
        { time: 0.65, color: new Color().setRGB(0.65, 0.65, 0.65, "srgb") },
        { time: 1.0, color: new Color().setRGB(0.311, 0.311, 0.311, "srgb") },
    ],

    shrinkAfter: 0.8,
    maxShrink: 0.0,
})

export class ModuleParticles {
    private rocketTime = 0
    private rocket: EntityWith<ExtendedComponents, "interpolation" | "rocket" | "rigidBody">

    private rocketDeathCollector: MessageCollector<RocketDeathMessage>

    private simulation: ParticleSimulation

    constructor(private runtime: ExtendedRuntime) {
        const shapes = runtime.factoryContext.store
            .find("shape")
            .map(x => x.components.shape.vertices.map(x => x.position))

        this.simulation = new ParticleSimulation(runtime, shapes)

        const [rocket] = runtime.factoryContext.store.find("rocket", "interpolation", "rigidBody")
        this.rocket = rocket

        this.rocketDeathCollector = runtime.factoryContext.messageStore.collect("rocketDeath")
    }

    update(delta: number) {
        this.simulation.onUpdate(delta)

        if (this.rocket.components.rocket.thrusting) {
            this.rocketTime += delta

            for (let i = 0; this.rocketTime >= 16 / 3; ++i) {
                this.rocketTime -= 16 / 3

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
            this.rocketTime = 0
        }

        for (const message of this.rocketDeathCollector) {
            for (let i = 0; i < 50; ++i) {
                const normal = message.normal
                const rotationFromNormal = Math.atan2(normal.y, normal.x)

                // console.log("death", message.position, message.contactPoint)

                this.simulation.createParticle(
                    PARTICLE_TEMPLATE_DEATH,
                    message.contactPoint,
                    rotationFromNormal + Math.PI / 2,
                    { x: 0, y: 0 },
                )
            }
        }
    }
}
