import { EntityType } from "runtime/proto/world"

export interface ResolveEntityOrderProps {
    entityType?: EntityType
    highlighted?: boolean
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

    const entityTypeWeights = {
        [EntityType.LEVEL]: 0.2,
        [EntityType.ROCKET]: 0.3,
        [EntityType.SHAPE]: 0.1,
    }

    weight(props.entityType && entityTypeWeights[props.entityType])
    weight(props.highlighted ? 1 : 0)
    weight(props.selected ? 1 : 0)
    weight(props.inAction ? 1 : 0)

    return z
}
