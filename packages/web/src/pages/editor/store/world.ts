import { WorldConfig } from "game/proto/world"
import { bytesToVertices, verticesToBytes } from "game/src/model/shape"
import { Point, Rect, ShapeVertex, Size, Transform } from "game/src/model/utils"
import { LEVEL_SIZE } from "game/src/modules/module-level"
import { ROCKET_SIZE } from "game/src/modules/module-rocket"
import { Immutable } from "immer"
import { generateUUID } from "three/src/math/MathUtils"
import { z } from "zod"

export type EditorFlag = z.infer<typeof EditorFlag>
export const EditorFlag = z.object({
    type: z.literal("flag"),

    bounds: Rect,
    capture: z.tuple([z.number(), z.number()]),

    group: z.string().optional(),
    size: Size,
    transform: Transform,
})

export type EditorGravitation = z.infer<typeof EditorGravitation>
export const EditorGravitation = z.object({
    type: z.literal("gravitation"),

    bounds: Rect,
    gravitation: Point,

    group: z.string().optional(),
    transform: Transform,
})

export type EditorRocket = z.infer<typeof EditorRocket>
export const EditorRocket = z.object({
    type: z.literal("rocket"),

    group: z.string().optional(),
    size: Size,
    transform: Transform,
})

export type EditorShape = z.infer<typeof EditorShape>
export const EditorShape = z.object({
    type: z.literal("shape"),

    group: z.string().optional(),
    transform: Transform,
    vertices: z.array(ShapeVertex),
})

export type EditorEntity = z.infer<typeof EditorEntity>
export const EditorEntity = z.discriminatedUnion("type", [
    EditorFlag,
    EditorGravitation,
    EditorRocket,
    EditorShape,
])

export type EditorGamemode = z.infer<typeof EditorGamemode>
export const EditorGamemode = z.object({
    groups: z.array(z.string()),
})

export type EditorWorld = z.infer<typeof EditorWorld>
export const EditorWorld = z.object({
    entities: z.record(z.string(), EditorEntity),
    gamemodes: z.record(z.string(), EditorGamemode),
})

export function* entitiesWith<T extends (keyof EntityComponents)[]>(
    world: Immutable<EditorWorld>,
    ...keys: T
): Generator<[string, EditorEntityWith<T[number]> & EditorEntity]> {
    for (const key in world.entities) {
        const entity = world.entities[key]

        if (keys.every(key => key in entity)) {
            yield [key, entity as any]
        }
    }
}

export type EditorEntityWith<T extends keyof EntityComponents> = Required<
    Pick<EntityComponents, T>
> &
    EditorEntity

export type EntityComponents = UnionToIntersectionWithout<EditorEntity, "type">

type UnionToIntersectionWithout<T, K extends keyof any> = (
    T extends any ? (x: Omit<T, K>) => void : never
) extends (x: infer R) => void
    ? R
    : never

export function editorWorldToConfig(world: Immutable<EditorWorld>): WorldConfig {
    const config = WorldConfig.create()

    const anyUngrouped = !Object.values(world.entities).every(x => x.group !== undefined)

    if (anyUngrouped) {
        config.groups[UNGROUPED_GROUP] = { levels: [], gravitations: [], rockets: [], shapes: [] }
    }

    for (const gamemodeKey in world.gamemodes) {
        const gamemode = world.gamemodes[gamemodeKey]
        config.gamemodes[gamemodeKey] = { groups: [...gamemode.groups] }

        for (const group of gamemode.groups) {
            config.groups[group] = { levels: [], gravitations: [], rockets: [], shapes: [] }
        }

        if (anyUngrouped) {
            config.gamemodes[gamemodeKey].groups.push(UNGROUPED_GROUP)
        }
    }

    for (const entityKey in world.entities) {
        const entity = world.entities[entityKey]
        const group = config.groups[entity.group ?? UNGROUPED_GROUP]

        if (group) {
            switch (entity.type) {
                case "flag":
                    group.levels.push({
                        cameraBottomRightX: entity.bounds.right + entity.transform.point.x,
                        cameraBottomRightY: entity.bounds.bottom + entity.transform.point.y,
                        cameraTopLeftX: entity.bounds.left + entity.transform.point.x,
                        cameraTopLeftY: entity.bounds.top + entity.transform.point.y,
                        captureAreaLeft: entity.capture[0],
                        captureAreaRight: entity.capture[1],
                        positionX: entity.transform.point.x - LEVEL_SIZE.width * 0.5,
                        positionY: entity.transform.point.y + LEVEL_SIZE.height * 0.5,
                        rotation: entity.transform.rotation,
                    })

                    break
                case "gravitation":
                    console.log({
                        positionX: entity.bounds.left + entity.transform.point.x,
                        positionY: entity.bounds.top + entity.transform.point.y,
                    })
                    group.gravitations.push({
                        gravitationX: entity.gravitation.x,
                        gravitationY: entity.gravitation.y,
                        height: entity.bounds.bottom - entity.bounds.top,
                        width: entity.bounds.right - entity.bounds.left,
                        positionX: entity.bounds.left + entity.transform.point.x,
                        positionY: entity.bounds.top + entity.transform.point.y,
                    })

                    break
                case "rocket":
                    group.rockets.push({
                        defaultConfig: undefined,
                        positionX: entity.transform.point.x - ROCKET_SIZE.width * 0.5,
                        positionY: entity.transform.point.y + ROCKET_SIZE.height * 0.5,
                        rotation: entity.transform.rotation,
                    })

                    break
                case "shape":
                    group.shapes.push({
                        vertices: verticesToBytes(
                            entity.vertices.map(v => ({
                                point: {
                                    x: v.point.x + entity.transform.point.x,
                                    y: v.point.y + entity.transform.point.y,
                                },
                                color: v.color,
                            })),
                        ),
                    })

                    break
            }
        }
    }

    return config
}

export function configToEditorWorld(config: WorldConfig): EditorWorld {
    const editorWorld: EditorWorld = {
        entities: {},
        gamemodes: {},
    }

    for (const gamemodeKey in config.gamemodes) {
        const gamemode = config.gamemodes[gamemodeKey]
        editorWorld.gamemodes[gamemodeKey] = {
            groups: gamemode.groups.filter((group: string) => group !== UNGROUPED_GROUP),
        }
    }

    for (const groupKey in config.groups) {
        const group = config.groups[groupKey]
        const isUngrouped = groupKey === UNGROUPED_GROUP

        for (const level of group.levels) {
            const id = generateUUID()

            const point = {
                x: level.positionX + LEVEL_SIZE.width * 0.5,
                y: level.positionY - LEVEL_SIZE.height * 0.5,
            }

            const flag: EditorFlag = {
                type: "flag",
                bounds: {
                    left: level.cameraTopLeftX - point.x,
                    top: level.cameraTopLeftY - point.y,
                    right: level.cameraBottomRightX - point.x,
                    bottom: level.cameraBottomRightY - point.y,
                },
                capture: [level.captureAreaLeft, level.captureAreaRight],
                transform: {
                    point,
                    rotation: level.rotation,
                },
                size: LEVEL_SIZE,
            }

            if (!isUngrouped) {
                flag.group = groupKey
            }

            editorWorld.entities[id] = flag
        }

        for (const gravitation of group.gravitations) {
            const id = generateUUID()

            const editorGravitation: EditorGravitation = {
                type: "gravitation",
                bounds: {
                    left: 0,
                    top: 0,
                    right: gravitation.width,
                    bottom: gravitation.height,
                },
                gravitation: {
                    x: gravitation.gravitationX,
                    y: gravitation.gravitationY,
                },
                transform: {
                    point: {
                        x: gravitation.positionX,
                        y: gravitation.positionY,
                    },
                    rotation: 0,
                },
            }

            if (!isUngrouped) {
                editorGravitation.group = groupKey
            }

            editorWorld.entities[id] = editorGravitation
        }

        for (const rocket of group.rockets) {
            const id = generateUUID()
            const editorRocket: EditorRocket = {
                type: "rocket",
                transform: {
                    point: {
                        x: rocket.positionX + ROCKET_SIZE.width * 0.5,
                        y: rocket.positionY - ROCKET_SIZE.height * 0.5,
                    },
                    rotation: rocket.rotation,
                },
                size: ROCKET_SIZE,
            }

            if (!isUngrouped) {
                editorRocket.group = groupKey
            }

            editorWorld.entities[id] = editorRocket
        }

        for (const shape of group.shapes) {
            const id = generateUUID()
            const vertices = bytesToVertices(shape.vertices)

            const centerX = vertices.reduce((sum, v) => sum + v.point.x, 0) / vertices.length
            const centerY = vertices.reduce((sum, v) => sum + v.point.y, 0) / vertices.length
            const center: Point = { x: centerX, y: centerY }

            const adjustedVertices: ShapeVertex[] = vertices.map(v => ({
                point: {
                    x: v.point.x - center.x,
                    y: v.point.y - center.y,
                },
                color: v.color,
            }))

            const editorShape: EditorShape = {
                type: "shape",
                transform: {
                    point: center,
                    rotation: 0,
                },
                vertices: adjustedVertices,
            }

            if (!isUngrouped) {
                editorShape.group = groupKey
            }

            editorWorld.entities[id] = editorShape
        }
    }

    return editorWorld
}

const UNGROUPED_GROUP = "__$$UNGROUPED$$__"
