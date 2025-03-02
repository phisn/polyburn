import RAPIER from "@dimforge/rapier2d"
import { GameOutput } from "game/src/model/game-output"
import { bytesToVertices } from "game/src/model/shape"
import { GamePlayerStore } from "../model/store"

export class ModuleSyncGame {
    constructor(private store: GamePlayerStore) {
        const config = this.store.resources.get("config")

        const groups = config.world.gamemodes[config.gamemode].groups.map(
            x => config.world.groups[x],
        )

        const levels = groups.flatMap(x => x.levels)
        const rockets = groups.flatMap(x => x.rockets)
        const shapes = groups.flatMap(x => x.shapes)

        if (rockets.length !== 1) {
            throw new Error("Expected exactly one rocket!")
        }

        const [rocket] = rockets

        if (levels.length < 2) {
            throw new Error("Expected at least two flags!")
        }

        const levelEntities = levels.map((level, index) => {
            return this.store.entities.create({
                level: {
                    bounding: {
                        bottom: level.cameraBottomRightY,
                        left: level.cameraTopLeftX,
                        right: level.cameraBottomRightX,
                        top: level.cameraTopLeftY,
                    },
                    config: level,
                    first: index === 0,
                },
                transform: {
                    point: {
                        x: level.positionX,
                        y: level.positionY,
                    },
                    rotation: level.rotation,
                },
            })
        })

        const rocketTransform = {
            point: {
                x: rocket.positionX,
                y: rocket.positionY,
            },
            rotation: rocket.rotation,
        }

        const rocketEntity = this.store.entities.create({
            interpolation: {
                sourceTransform: rocketTransform,
                targetTransform: rocketTransform,
            },
            rocket: {
                config: rocket,
                thrust: false,
                velocity: {
                    x: 0,
                    y: 0,
                },
            },
            transform: rocketTransform,
        })

        for (const shape of shapes) {
            this.store.entities.create({
                shape: {
                    config: shape,
                    vertices: bytesToVertices(RAPIER, shape.vertices),
                },
            })
        }
    }

    onReset() {
        for (const rocketEntity of this.store.entities.multiple(
            "interpolation",
            "rocket",
            "transform",
        )) {
            const rocket = rocketEntity.get("rocket")
            rocket.thrust = false
        }
    }

    onFixedUpdate(frame: GameOutput) {
        if (frame.levelCaptureChange) {
        }
    }

    /*

        outputEvents.listen({
            levelCaptureChange: ({ level, started }) =>
                this.store.events.invoke.captureChanged?.({
                    level: levelEntities[level],
                    started,
                }),
            levelCaptured: ({ level }) =>
                this.store.events.invoke.captured?.({
                    level: levelEntities[level],
                }),
            rocketChange: ({ transform, velocity }) => {
                rocketEntity.get("rocket").velocity = velocity
                rocketEntity.set("transform", transform)
            },
            rocketDeath: ({ contactPoint, normal }) =>
                this.store.events.invoke.death?.({
                    contactPoint,
                    normal,
                }),
            rocketThrust: ({ started }) => {
                rocketEntity.get("rocket").thrust = started
            },
        })
        */
}
