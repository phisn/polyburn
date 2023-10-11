import { EntityType } from "runtime/proto/world"
import { BaseComponents } from "../models-components/base-components"
import { ObjectComponent } from "../models-components/object-component"

export interface RocketComponents extends BaseComponents {
    type: EntityType.ROCKET
    object: ObjectComponent
}
