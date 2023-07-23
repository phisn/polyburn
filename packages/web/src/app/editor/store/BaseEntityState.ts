import { EntityType } from "runtime/src/core/common/EntityType"

export interface BaseEntityState {
    type: EntityType
    id: number

    group?: string
}
