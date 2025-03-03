import { EntityWith } from "game/src/framework/entity"
import { lerp, slerp, Transform } from "game/src/model/utils"
import { PresentationComponents, PresentationStore } from "../store"

export interface InterpolationComponent {
    sourceTransform: Transform
    targetTransform: Transform
}

export class ModuleInterpolation {
    private toInterpolate: readonly EntityWith<
        PresentationComponents,
        "interpolation" | "transform" | "visual"
    >[]

    constructor(private store: PresentationStore) {
        this.toInterpolate = store.entities.multiple("interpolation", "transform", "visual")

        const getRocket = store.entities.single("interpolation", "rocket", "transform", "visual")

        store.events.listen({
            death: () => this.resetInterpolation(getRocket()),
        })

        store.entities.listen(
            ["transform", "velocity"],
            entity => {
                const transform = entity.get("transform")

                entity.set("interpolation", {
                    sourceTransform: transform,
                    targetTransform: transform,
                })
            },
            () => void 0,
        )
    }

    onReset() {
        for (const toInterpolate of this.toInterpolate) {
            this.resetInterpolation(toInterpolate)
        }
    }

    onUpdate(overstep: number) {
        for (const toInterpolate of this.toInterpolate) {
            const interpolation = toInterpolate.get("interpolation")
            const visual = toInterpolate.get("visual")

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

            visual.position.set(x, y, 0)
            visual.rotation.set(0, 0, rotation)
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
        entity: EntityWith<PresentationComponents, "interpolation" | "transform" | "visual">,
    ) {
        const interpolation = entity.get("interpolation")
        const visual = entity.get("visual")
        const transform = entity.get("transform")

        interpolation.sourceTransform = transform
        interpolation.targetTransform = transform

        visual.position.set(transform.point.x, transform.point.y, 0)
        visual.rotation.set(0, 0, transform.rotation)
    }
}
