import { EntityType } from "runtime/proto/world"
import { BaseComponents } from "../model-components/base-components"
import { ShapeComponent } from "../model-components/shape-component"

export interface ShapeComponents extends BaseComponents {
    type: EntityType.ROCKET
    shape: ShapeComponent
}
