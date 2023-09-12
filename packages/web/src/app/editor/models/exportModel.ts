import { EntityType, WorldModel } from "runtime/proto/world"
import { verticesToBytes } from "runtime/src/model/world/ShapeModel"
import { WorldState } from "./WorldState"

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
                            position: {
                                x: v.position.x + entity.position.x,
                                y: v.position.y + entity.position.y,
                            },
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

export function bytesToBase64(bytes: Uint8Array) {
    const binString = Array.from(bytes, x => String.fromCodePoint(x)).join("")
    return btoa(binString)
}

export function exportModelString(world: WorldState): string {
    return bytesToBase64(WorldModel.encode(exportModel(world)).finish())
}
