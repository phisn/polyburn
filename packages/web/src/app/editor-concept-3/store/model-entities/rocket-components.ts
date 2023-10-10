import { EntityType } from "runtime/proto/world"
import { BaseComponents } from "../model-components/base-components"
import { ObjectComponent } from "../model-components/object-component"

export interface RocketComponents extends BaseComponents {
    type: EntityType.ROCKET
    object: ObjectComponent
}
