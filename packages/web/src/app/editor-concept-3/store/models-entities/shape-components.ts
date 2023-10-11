import { EntityType } from "runtime/proto/world"
import { BaseComponents } from "../models-components/base-components"
import { ShapeComponent } from "../models-components/shape-component"

export interface ShapeComponents extends BaseComponents {
    type: EntityType.ROCKET
    shape: ShapeComponent
}
