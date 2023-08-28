import { EntityType, WorldModel } from "runtime/proto/world"
import { bytesToVertices } from "runtime/src/model/world/ShapeModel"
import { Vector2 } from "three"
import { LevelState } from "../entities/level/LevelState"
import { RocketState } from "../entities/rocket/RocketState"
import { ShapeState } from "../entities/shape/ShapeState"
import { WorldState } from "./WorldState"

export function importModel(model: WorldModel): WorldState {
    let lastId = 0

    const k: WorldState = {
        gamemodes: Object.entries(model.gamemodes).map(([name, gamemode]) => ({
            name,
            groups: gamemode.groups,
        })),
        entities: new Map<number, any>(
            Object.entries(model.groups)
                .flatMap(([group, groupModel]) => [
                    ...groupModel.levels.map(
                        (level): LevelState => ({
                            type: EntityType.LEVEL,
                            id: ++lastId,
                            group,

                            position: { x: level.positionX, y: level.positionY },
                            rotation: level.rotation,

                            cameraTopLeft: { x: level.cameraTopLeftX, y: level.cameraTopLeftY },
                            cameraBottomRight: {
                                x: level.cameraBottomRightX,
                                y: level.cameraBottomRightY,
                            },

                            captureLeft: level.captureAreaLeft,
                            captureRight: level.captureAreaRight,
                        }),
                    ),
                    ...groupModel.shapes.map(
                        (shape): ShapeState => ({
                            type: EntityType.SHAPE,
                            id: ++lastId,
                            group,

                            position: { x: 0, y: 0 },
                            vertices: bytesToVertices(shape.vertices).map((v, i) => ({
                                position: new Vector2(v.position.x, v.position.y),
                                color: v.color,
                            })),
                        }),
                    ),
                    ...groupModel.rockets.map(
                        (rocket): RocketState => ({
                            type: EntityType.ROCKET,
                            id: ++lastId,
                            group,

                            position: { x: rocket.positionX, y: rocket.positionY },
                            rotation: rocket.rotation,
                        }),
                    ),
                ])
                .map(v => [v.id, v]),
        ),
    }

    console.log("k has " + k.entities.size + " entities")

    return k
}

export function base64ToBytes(base64: string) {
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0))
}

export function importModelString(model: string): WorldState {
    return importModel(WorldModel.decode(base64ToBytes(model)))
}
