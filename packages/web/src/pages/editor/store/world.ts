import { Point, Rect, Size, Transform } from "game/src/model/utils"
import { LEVEL_SIZE } from "game/src/modules/module-level"
import { ROCKET_SIZE } from "game/src/modules/module-rocket"
import { createActions, Entity, ExtractSchema, Or, relation, trait } from "koota"

export const BehaviorTransform = trait<Transform>({
    rotation: 0,
    point: { x: 0, y: 0 },
})
export const BehaviorSize = trait<Size>({
    width: 5,
    height: 5,
})
export const BehaviorBounding = trait<Rect>({
    bottom: -10,
    left: -10,
    right: 10,
    top: 10,
})
export const BehaviorShape = trait<() => EditableShape>(() => ({
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
}))

export const Level = trait()
export const LevelBounds = trait()
export const Rocket = trait()
export const Shape = trait()

export const Gamemode = trait({
    name: "missing_name",
})
export const Group = trait({
    name: "missing_name",
})

export const Highlighted = trait<{
    point?: Point & {
        color: string
    }
}>({
    point: undefined,
})
export const Selected = trait()

export const Owns = relation({ autoRemoveTarget: true })
export const References = relation()

export const editorActions = createActions(world => ({
    clearSelected: () => {
        for (const entity of world.query(Selected)) {
            entity.remove(Selected)
        }
    },
    select: (entity: Entity) => {
        for (const entity of world.query(Selected)) {
            entity.remove(Selected)
        }

        for (const other of world.query(Or(Owns(entity), References(entity)))) {
            other.add(Selected)
        }
    },
    selectAdditive: (entity: Entity) => {
        entity.add(Selected)

        for (const other of world.query(Or(Owns(entity), References(entity)))) {
            other.add(Selected)
        }
    },

    clearHighlights: () => {
        for (const entity of world.query(Highlighted)) {
            entity.remove(Highlighted)
        }
    },
    highlight: (entity: Entity, highlight?: ExtractSchema<typeof Highlighted>) => {
        if (entity.has(Highlighted) && entity.get(Highlighted) === highlight) {
            return
        }

        entity.add(Highlighted(highlight))

        for (const other of world.query(Or(Owns(entity), References(entity)))) {
            other.add(Highlighted(highlight))
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
            BehaviorTransform({ point, rotation: 0 }),
            Rocket,
            BehaviorSize(ROCKET_SIZE),
        )

        console.log(BehaviorSize({ width: 9, height: 0 }))

        console.log(rocket.has(BehaviorTransform), JSON.stringify(rocket.get(BehaviorTransform)))

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

export type EditableShape = {
    vertices: EditableShapeVertex[]
}

export interface EditableShapeVertex {
    point: Point
    color: number
}
