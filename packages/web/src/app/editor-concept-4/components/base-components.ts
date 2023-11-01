import { EntityType } from "runtime/proto/world"
import { ObjectComponent } from "./object/object-component"
import { ShapeComponent } from "./shape/shape-component"

export interface BaseComponents {
    type: EntityType
    group: string | undefined

    object?: ObjectComponent
    shape?: ShapeComponent
}
