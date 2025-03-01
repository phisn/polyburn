import { EntityWith } from "game/src/framework/entity"
import { lerp, slerp } from "game/src/model/utils"
import { GamePlayerComponents } from "../model/entity"
import { GamePlayerStore } from "../model/store"

export class ModuleInterpolation {
    private toInterpolate: readonly EntityWith<
        GamePlayerComponents,
        "interpolation" | "three" | "transform"
    >[]

    constructor(private store: GamePlayerStore) {
        this.toInterpolate = store.entities.multiple("interpolation", "three", "transform")

        const getRocket = store.entities.single("interpolation", "rocket", "three", "transform")
        store.events.listen({
            death: () => this.resetInterpolation(getRocket()),
        })
    }

    onReset() {
        for (const toInterpolate of this.toInterpolate) {
            this.resetInterpolation(toInterpolate)
        }
    }

    onUpdate(overstep: number) {
        for (const toInterpolate of this.toInterpolate) {
            const interpolation = toInterpolate.get("interpolation")
            const three = toInterpolate.get("three")

            const x = lerp(
                interpolation.sourceTransform.point.x,
                interpolation.targetTransform.point.x,
                overstep,
            )

            const y = lerp(
                interpolation.sourceTransform.point.y,
                interpolation.targetTransform.point.y,
                overstep,
            )

            const rotation = slerp(
                interpolation.sourceTransform.rotation,
                interpolation.targetTransform.rotation,
                overstep,
            )

            three.position.set(x, y, 0)
            three.rotation.set(0, 0, rotation)
        }
    }

    onFixedUpdate(last: boolean) {
        if (last === false) {
            return
        }

        for (const toInterpolate of this.toInterpolate) {
            const interpolation = toInterpolate.get("interpolation")
            const transform = toInterpolate.get("transform")

            interpolation.sourceTransform = interpolation.targetTransform
            interpolation.targetTransform = transform
        }
    }

    private resetInterpolation(
        entity: EntityWith<GamePlayerComponents, "interpolation" | "three" | "transform">,
    ) {
        const interpolation = entity.get("interpolation")
        const three = entity.get("three")
        const transform = entity.get("transform")

        interpolation.sourceTransform = transform
        interpolation.targetTransform = transform

        three.position.set(transform.point.x, transform.point.y, 0)
        three.rotation.set(0, 0, transform.rotation)
    }
}
