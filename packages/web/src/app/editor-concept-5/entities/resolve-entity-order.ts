import { EntityType } from "runtime/proto/world"
import { BaseBehaviors, behaviorOrder } from "../behaviours/base-behaviors"

export interface ResolveEntityOrderProps {
    entityType?: EntityType
    behaviorType?: keyof BaseBehaviors
    hovered?: boolean
    selected?: boolean
    inAction?: boolean
}

// used in ordering entities in the scene. entities must not necessarily have different z-indexes
// provides a value between 0 and 1 where later weights have more impact
export function resolveEntityOrder(props: ResolveEntityOrderProps) {
    let z = 0

    function weight(value?: number) {
        z /= 10
        z += value || 0
    }

    function weightFromArray<T>(values: T[], target?: T) {
        if (target === undefined) {
            weight()
        } else {
            const index = values.indexOf(target)

            if (index === -1) {
                console.error("weightFromArray: target not found in values", target, values)
            }

            weight(index / values.length)
        }
    }

    const entityTypeWeights = {
        [EntityType.LEVEL]: 0.2,
        [EntityType.ROCKET]: 0.3,
        [EntityType.SHAPE]: 0.1,
    }

    weight(props.entityType && entityTypeWeights[props.entityType])
    weightFromArray(behaviorOrder, props.behaviorType)
    weight(props.hovered ? 1 : 0)
    weight(props.selected ? 1 : 0)
    weight(props.inAction ? 1 : 0)

    return z
}
