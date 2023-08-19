import { EntityType } from "runtime/proto/world"

export interface EntityStateBase {
    type: EntityType
    id: number
    group?: string
}
