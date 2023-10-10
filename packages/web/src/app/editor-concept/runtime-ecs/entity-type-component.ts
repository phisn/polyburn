import { EntityType } from "runtime/proto/world"

export interface EntityTypeComponent {
    type(): EntityType
}
