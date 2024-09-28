import { lerp, slerp, Transform } from "game/src/model/utils"
import { Object3D } from "three"
import { GamePlayerStore } from "../model/store"

export interface InterpolationResource {
    register(object: Object3D, getTransform: () => Transform): { reset: () => void }
}

interface InterpolationRegistration {
    object: Object3D

    source: Transform
    target: Transform

    getTransform: () => Transform
}

export class ModuleInterpolation {
    private registrations: InterpolationRegistration[]

    constructor(private store: GamePlayerStore) {
        store.resources.set("interpolation", {
            register: (object, getTransform) => {
                const registration = {
                    object,
                    source: getTransform(),
                    target: getTransform(),
                    getTransform,
                }

                this.registrations.push(registration)

                return {
                    reset: () => {
                        const transform = registration.getTransform()

                        registration.source = transform
                        registration.target = transform

                        registration.object.position.x = transform.point.x
                        registration.object.position.y = transform.point.y
                        registration.object.rotation.z = transform.rotation
                    },
                }
            },
        })

        this.registrations = []
    }

    onUpdate(overstep: number) {
        for (const registration of this.registrations) {
            registration.object.position.x = lerp(
                registration.source.point.x,
                registration.target.point.x,
                overstep,
            )

            registration.object.position.y = lerp(
                registration.source.point.y,
                registration.target.point.y,
                overstep,
            )

            registration.object.rotation.z = slerp(
                registration.source.rotation,
                registration.target.rotation,
                overstep,
            )
        }
    }

    onFixedUpdate(last: boolean) {
        if (last === false) {
            return
        }

        for (let i = 0; i < this.registrations.length; i++) {
            const registration = this.registrations[i]

            if (registration.object.parent === null) {
                console.warn("Interpolation object has no parent")
                this.registrations[i] = this.registrations[this.registrations.length - 1]
                this.registrations.pop()
            } else {
                registration.source = registration.target
                registration.target = registration.getTransform()
            }
        }
    }
}

/*
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

    onFixedUpdate(last: boolean) {
        if (last === false) {
            return
        }

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

*/
