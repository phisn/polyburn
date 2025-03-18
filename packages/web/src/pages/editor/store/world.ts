import { Point, Rect, Size, Transform } from "game/src/model/utils"
import { LEVEL_SIZE } from "game/src/modules/module-level"
import { ROCKET_SIZE } from "game/src/modules/module-rocket"
import { createActions, relation, trait } from "koota"
import { Color } from "three"

export const BehaviorTransform = trait<() => Transform>()
export const BehaviorSize = trait<() => Size>()
export const BehaviorBounding = trait<() => Rect>()
export const BehaviorShape = trait<() => EditableShape>()

export const Level = trait()
export const LevelBounds = trait()
export const Rocket = trait()
export const Shape = trait()

export const Gamemode = trait<{
    name: string
}>()
export const Group = trait<{
    name: string
}>()

export const Highlighted = trait<{
    point: Point & {
        color: Color
    }
}>()
export const Selected = trait()

export const Owns = relation({ autoRemoveTarget: true })
export const References = relation()

export const editorActions = createActions(world => ({
    clearFocus: () => {
        for (const entity of world.query(Selected)) {
            entity.remove(Selected)
        }
    },

    createGamemode: (name: string) => {
        const gamemode = world.spawn(Gamemode({ name }))
        return gamemode
    },
    createGroup: (name: string) => {
        const group = world.spawn(Group({ name }))
        return group
    },

    spawnLevel: (point: Point) => {
        const level = world.spawn(
            Level,
            BehaviorTransform({ point, rotation: 0 }),
            BehaviorSize(LEVEL_SIZE),
        )

        const levelBounds = world.spawn(
            LevelBounds,
            BehaviorTransform({ point, rotation: 0 }),
            BehaviorBounding({ bottom: 10, left: -10, right: 10, top: -10 }),
        )

        level.add(Owns(levelBounds))
        levelBounds.add(Owns(level))

        return { level, levelBounds }
    },
    spawnRocket: (point: Point) => {
        const rocket = world.spawn(
            Level,
            BehaviorTransform({ point, rotation: 0 }),
            BehaviorSize(ROCKET_SIZE),
        )

        return rocket
    },
    spawnShape: (point: Point) => {
        const shape = world.spawn(
            Shape,
            BehaviorTransform({ point, rotation: 0 }),
            BehaviorShape({
                vertices: [
                    {
                        point: {
                            x: 3,
                            y: 3,
                        },
                        color: 0xffffff,
                    },
                    {
                        point: {
                            x: -3,
                            y: 3,
                        },
                        color: 0xffffff,
                    },
                    {
                        point: {
                            x: -2,
                            y: -3,
                        },
                        color: 0xffffff,
                    },
                    {
                        point: {
                            x: 3,
                            y: -3,
                        },
                        color: 0xffffff,
                    },
                ],
            }),
        )

        return shape
    },
}))

export interface EditableShape {
    vertices: EditableShapeVertex[]
}

export interface EditableShapeVertex {
    point: Point
    color: number
}
