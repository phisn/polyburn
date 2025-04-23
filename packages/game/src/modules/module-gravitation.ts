import { GravitationConfig } from "../../proto/world"
import { EntityWith } from "../framework/entity"
import { GameInput } from "../game"
import { Point, Rect, Transform } from "../model/utils"
import { GameComponents, GameStore } from "../store"
import { rocketComponents, RocketEntity } from "./module-rocket"
import { DEFAULT_GRAVITATION } from "./module-world"

export interface GravitationComponent {
    direction: Point
    rect: Rect
}

export const gravitationComponents = ["gravitation", "transform"] satisfies (keyof GameComponents)[]
export type GravitationEntity<Components extends GameComponents = GameComponents> = EntityWith<
    Components,
    (typeof gravitationComponents)[number]
>

export class ModuleGravitation {
    private getRocket: () => RocketEntity
    private gravitations: readonly EntityWith<GameComponents, "gravitation">[]

    constructor(private store: GameStore) {
        this.getRocket = store.entities.single("body", ...rocketComponents)
        this.gravitations = store.entities.multiple("transform", "gravitation")
    }

    onReset() {
        for (const gravitation of this.store.entities.multipleCopy(...gravitationComponents)) {
            this.store.entities.remove(gravitation)
        }

        const config = this.store.resources.get("config")

        const groups = config.world.gamemodes[config.gamemode].groups.map(
            groupName => config.world.groups[groupName],
        )

        for (const gravitationConfig of groups.flatMap(group => group.gravitations)) {
            this.constructGravitation(gravitationConfig)
        }
    }

    onUpdate(_input: GameInput) {
        if (this.gravitations.length === 0) {
            return
        }

        const rocket = this.getRocket()
        const rocketTransform = rocket.get("transform")

        let found = false

        console.log("looking: ", rocketTransform.point)

        for (const entity of this.gravitations) {
            const gravitation = entity.get("gravitation")

            console.log("looking: ", gravitation.rect)

            if (
                rocketTransform.point.x > gravitation.rect.left &&
                rocketTransform.point.y > gravitation.rect.top &&
                rocketTransform.point.x < gravitation.rect.right &&
                rocketTransform.point.y < gravitation.rect.bottom
            ) {
                this.store.resources.get("world").gravity.x =
                    gravitation.direction.x * DEFAULT_GRAVITATION
                this.store.resources.get("world").gravity.y =
                    gravitation.direction.y * DEFAULT_GRAVITATION

                found = true

                break
            }
        }

        console.log("found: ", found)

        if (!found) {
            this.store.resources.get("world").gravity.x = 0
            this.store.resources.get("world").gravity.y = DEFAULT_GRAVITATION
        }
    }

    private constructGravitation(gravitationConfig: GravitationConfig) {
        const rapier = this.store.resources.get("rapier")
        const world = this.store.resources.get("world")

        const transform: Transform = {
            point: {
                x: gravitationConfig.positionX,
                y: gravitationConfig.positionY,
            },
            rotation: 0,
        }

        const body = world.createRigidBody(new rapier.RigidBodyDesc(rapier.RigidBodyType.Fixed))

        this.store.entities.create({
            body,
            gravitation: {
                direction: {
                    x: gravitationConfig.gravitationX,
                    y: gravitationConfig.gravitationY,
                },
                rect: {
                    left: gravitationConfig.positionX,
                    top: gravitationConfig.positionY,
                    right: gravitationConfig.positionX + gravitationConfig.width,
                    bottom: gravitationConfig.positionY + gravitationConfig.height,
                },
            },
            transform,
        }) satisfies GravitationEntity
    }
}
