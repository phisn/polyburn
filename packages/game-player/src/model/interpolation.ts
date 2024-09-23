import { EntityWith } from "game/src/framework/entity"
import { Game } from "game/src/game"
import { GameComponents } from "game/src/model/store"

export interface Interpolation {
    x: number
    y: number
    rotation: number
}

interface MappingEntry {
    interpolation: Interpolation
    entity: EntityWith<GameComponents, "body">

    previousX: number
    previousY: number
    previousRotation: number
}

export class InterpolationStore {
    private mapping: Map<number, MappingEntry> = new Map()

    constructor(game: Game) {
        game.store.entities.listen(
            ["body"],
            entity => {
                const body = entity.get("body")

                if (body.isFixed() === false) {
                    this.mapping.set(entity.id, {
                        interpolation: {
                            x: body.translation().x,
                            y: body.translation().y,
                            rotation: body.rotation(),
                        },
                        entity,

                        previousX: body.translation().x,
                        previousY: body.translation().y,
                        previousRotation: body.rotation(),
                    })
                }
            },
            entity => {
                this.mapping.delete(entity.id)
            },
        )
    }

    get(id: number): Interpolation | undefined {
        return this.mapping.get(id)?.interpolation
    }

    *interpolations() {
        for (const [id, { interpolation }] of this.mapping) {
            yield [id, interpolation] as const
        }
    }

    reset(id: number) {
        const entry = this.mapping.get(id)

        if (entry === undefined) {
            return
        }

        const { entity, interpolation } = entry

        interpolation.x = entity.get("body").translation().x
        interpolation.y = entity.get("body").translation().y
        interpolation.rotation = entity.get("body").rotation()

        entry.previousX = interpolation.x
        entry.previousY = interpolation.y
        entry.previousRotation = interpolation.rotation
    }

    onUpdate(_delta: number, overstep: number) {
        for (const entry of this.mapping.values()) {
            const { entity, interpolation } = entry

            const translation = entity.get("body").translation()
            const rotation = entity.get("body").rotation()

            interpolation.x = lerp(entry.previousX, translation.x, overstep)
            interpolation.y = lerp(entry.previousY, translation.y, overstep)
            interpolation.rotation = slerp(entry.previousRotation, rotation, overstep)

            entry.previousX = interpolation.x
            entry.previousY = interpolation.y
            entry.previousRotation = interpolation.rotation
        }
    }

    onLastFixedUpdate() {
        for (const entry of this.mapping.values()) {
            const { entity, interpolation } = entry

            const translation = entity.get("body").translation()
            const rotation = entity.get("body").rotation()

            interpolation.x = translation.x
            interpolation.y = translation.y
            interpolation.rotation = rotation

            entry.previousX = translation.x
            entry.previousY = translation.y
            entry.previousRotation = rotation
        }
    }
}

export function lerp(previous: number, next: number, t: number) {
    return (1 - t) * previous + t * next
}

export function slerp(previous: number, next: number, t: number) {
    const difference = next - previous
    const shortestAngle = (((difference % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI

    return previous + shortestAngle * t
}
