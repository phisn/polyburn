import { EntityType } from "runtime/proto/world"
import { BaseComponents } from "../components/base-components"
import { ObjectComponent } from "../components/object-component"

export interface RocketComponents extends BaseComponents {
    type: EntityType.ROCKET
    object: ObjectComponent
}
