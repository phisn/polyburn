import { EntityWith } from "game/src/framework/entity"
import { changeAnchor } from "game/src/model/utils"
import { ROCKET_SIZE } from "game/src/modules/module-rocket"
import { Color } from "three"
import { PresentationComponents, PresentationStore } from "../../store"
import {
    downBias,
    ParticleTemplate,
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
    private simulation: ParticleSimulation

    private getRocket: () => EntityWith<PresentationComponents, "rocket" | "velocity" | "visual">

    constructor(private store: PresentationStore) {
        this.simulation = new ParticleSimulation(store)

        this.getRocket = store.entities.single("rocket", "velocity", "visual")

        store.events.listen({
            death: ({ normal, contactPoint }) => {
                for (let i = 0; i < 50; ++i) {
                    const rotationFromNormal = Math.atan2(normal.y, normal.x)

                    this.simulation.createParticle(
                        PARTICLE_TEMPLATE_DEATH,
                        contactPoint,
                        rotationFromNormal + Math.PI / 2,
                        { x: 0, y: 0 },
                    )
                }
            },
        })
    }

    onUpdate(delta: number) {
        this.simulation.onUpdate(delta)

        const rocketEntity = this.getRocket()
        const rocket = rocketEntity.get("rocket")

        if (rocket.thrust) {
            const velocity = rocketEntity.get("velocity")
            const visual = rocketEntity.get("visual")

            this.rocketTime += delta

            const spawnPosition = changeAnchor(
                visual.position,
                visual.rotation.z,
                ROCKET_SIZE,
                { x: 0.5, y: 0.5 },
                { x: 0.5, y: 0.3 },
            )

            for (let i = 0; this.rocketTime >= 16 / 3; ++i) {
                this.rocketTime -= 16 / 3

                this.simulation.createParticle(
                    PARTICLE_TEMPLATE_THRUST,
                    spawnPosition,
                    visual.rotation.z,
                    velocity,
                    i,
                )
            }
        } else {
            this.rocketTime = 0
        }
    }
}
