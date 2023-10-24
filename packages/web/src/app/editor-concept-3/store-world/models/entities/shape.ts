import { EntityType } from "runtime/proto/world"
import { BaseComponents } from "../components/base-components"
import { ObjectComponent } from "../components/object-component"
import { ShapeComponent } from "../components/shape-component"

export interface ShapeComponents extends BaseComponents {
    type: EntityType.SHAPE
    shape: ShapeComponent
    object: ObjectComponent
}
