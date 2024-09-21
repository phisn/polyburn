import { EntityWith } from "../framework/entity"
import { GameInput } from "../game"
import { GameComponents, GameStore } from "../model/store"
import { Size, changeAnchor } from "../model/utils"

export interface RocketComponent {
    thrust: boolean
}

export const rocketComponents = ["rocket", "body"] satisfies (keyof GameComponents)[]
export type RocketEntity = EntityWith<GameComponents, (typeof rocketComponents)[number]>

export class ModuleRocket {
    private getRocket: () => RocketEntity

    constructor(private store: GameStore) {
        this.getRocket = store.entities.single(...rocketComponents)
    }

    onUpdate({ thrust }: GameInput) {
        const rocket = this.getRocket()

        rocket.get("rocket").thrust = thrust
    }

    onReset() {
        for (const rocket of this.store.entities.multipleCopy(...rocketComponents)) {
            this.store.entities.remove(rocket)
        }

        const rocketConfig = this.store.resources.get("config").rocket
        const rapier = this.store.resources.get("rapier")
        const world = this.store.resources.get("world")

        const position = {
            x: rocketConfig.positionX,
            y: rocketConfig.positionY,
        }

        const center = changeAnchor(
            position,
            rocketConfig.rotation,
            ROCKET_SIZE,
            { x: 0, y: 1 },
            { x: 0.5, y: 0.5 },
        )

        const body = world.createRigidBody(
            rapier.RigidBodyDesc.dynamic()
                .setTranslation(center.x, center.y)
                .setRotation(rocketConfig.rotation)
                .setCcdEnabled(true)
                .setAngularDamping(0.05),
        )

        ROCKET_COLLIDERS.forEach((vertices, index) => {
            const collider = rapier.ColliderDesc.convexHull(new Float32Array(vertices))

            if (collider === null) {
                throw new Error("Failed to create collider")
            }

            collider
                .setActiveEvents(rapier.ActiveEvents.COLLISION_EVENTS)
                .setMass(index === 0 ? 20 : 0.5)
                .setCollisionGroups(0x00_01_00_02)

            world.createCollider(collider, body)
        })

        this.store.entities.create({
            rocket: {
                thrust: false,
            },
            body,
        })
    }
}

const ROCKET_COLLIDERS = [
    [
        -0.894, -1.212, -0.882, -0.33, -0.87, -0.144, -0.834, 0.096, -0.708, 0.588, -0.456, 1.152,
        -0.198, 1.548, 0, 1.8, 0.198, 1.548, 0.456, 1.152, 0.708, 0.588, 0.834, 0.096, 0.87, -0.144,
        0.882, -0.33, 0.894, -1.212,
    ],
    [0.9, -1.8, 0.24, -1.212, 0.894, -1.212],
    [-0.9, -1.8, -0.894, -1.212, -0.24, -1.212],
]

export const ROCKET_SIZE: Size = {
    width: 1.8,
    height: 3.6,
}
