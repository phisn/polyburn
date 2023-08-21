import { EntityType, WorldModel } from "runtime/proto/world"
import { bytesToVertices, verticesToBytes } from "runtime/src/model/ShapeModel"
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
                            group: group === "" ? undefined : group,

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
                            group: group === "" ? undefined : group,

                            position: { x: 0, y: 0 },
                            vertices: bytesToVertices(shape.vertices).map(v => ({
                                position: new Vector2(v.position.x, v.position.y),
                                color: v.color,
                            })),
                        }),
                    ),
                    ...groupModel.rockets.map(
                        (rocket): RocketState => ({
                            type: EntityType.ROCKET,
                            id: ++lastId,
                            group: group === "" ? undefined : group,

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

export function exportModel(world: WorldState): WorldModel {
    const model: WorldModel = {
        gamemodes: {},
        groups: {},
    }

    for (const gamemode of world.gamemodes) {
        model.gamemodes[gamemode.name] = {
            groups: gamemode.groups,
        }
    }

    for (const entity of world.entities.values()) {
        const group =
            model.groups[entity.group ?? ""] ||
            (model.groups[entity.group ?? ""] = {
                levels: [],
                shapes: [],
                rockets: [],
            })

        switch (entity.type) {
            case EntityType.LEVEL:
                group.levels.push({
                    positionX: entity.position.x,
                    positionY: entity.position.y,
                    rotation: entity.rotation,

                    cameraTopLeftX: entity.cameraTopLeft.x,
                    cameraTopLeftY: entity.cameraTopLeft.y,
                    cameraBottomRightX: entity.cameraBottomRight.x,
                    cameraBottomRightY: entity.cameraBottomRight.y,

                    captureAreaLeft: entity.captureLeft,
                    captureAreaRight: entity.captureRight,
                })
                break

            case EntityType.SHAPE:
                group.shapes.push({
                    vertices: verticesToBytes(
                        entity.vertices.map(v => ({
                            position: { x: v.position.x, y: v.position.y },
                            color: v.color,
                        })),
                    ),
                })
                break

            case EntityType.ROCKET:
                group.rockets.push({
                    positionX: entity.position.x,
                    positionY: entity.position.y,
                    rotation: entity.rotation,
                    defaultConfig: undefined,
                })
                break
        }
    }

    return model
}

function bytesToBase64(bytes: Uint8Array) {
    const binString = Array.from(bytes, x => String.fromCodePoint(x)).join("")
    return btoa(binString)
}

export function exportModelString(world: WorldState): string {
    return bytesToBase64(WorldModel.encode(exportModel(world)).finish())
}
