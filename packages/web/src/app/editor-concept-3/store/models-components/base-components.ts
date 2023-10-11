import { EntityType } from "runtime/proto/world"
import { ObjectComponent } from "./object-component"
import { ShapeComponent } from "./shape-component"

export interface BaseComponents {
    type: EntityType
    group: string | undefined

    object?: ObjectComponent
    shape?: ShapeComponent
}
