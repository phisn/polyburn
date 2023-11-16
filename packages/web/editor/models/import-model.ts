import { EntityType, ShapeModel, WorldModel } from "runtime/proto/world"
import { bytesToVertices } from "runtime/src/model/world/shape-model"
import { Vector2 } from "three"
import { LevelState } from "../entities/level/level-state"
import { RocketState } from "../entities/rocket/rocket-state"
import { ShapeState } from "../entities/shape/shape-state"
import { WorldState } from "./world-state"

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
                        (shape): ShapeState => importShapeModel(++lastId, group, shape),
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

    return k
}

export function importShapeModel(
    id: number,
    group: string | undefined,
    shape: ShapeModel,
): ShapeState {
    return {
        type: EntityType.SHAPE,
        id,
        group,

        position: { x: 0, y: 0 },
        vertices: bytesToVertices(shape.vertices).map(v => ({
            position: new Vector2(v.position.x, v.position.y),
            color: v.color,
        })),
    }
}

export function base64ToBytes(base64: string) {
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0))
}

export function importModelString(model: string): WorldState {
    return importModel(WorldModel.decode(base64ToBytes(model)))
}
