import { lerp, slerp, Transform } from "game/src/model/utils"
import { Object3D } from "three"
import { GamePlayerStore } from "../model/store"

export interface InterpolationResource {
    register(object: Object3D, getTransform: () => Transform): { reset: () => void }
}

interface InterpolationRegistration {
    getTransform: () => Transform
    object: Object3D
    source: Transform
    target: Transform
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
