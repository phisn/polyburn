import { EntityType } from "runtime/proto/world"
import { BaseComponents } from "../../components/base-components"
import { ObjectComponent } from "../../components/object/object-component"
import { Entity, ImmutableEntity } from "../entity"

export interface RocketComponents extends BaseComponents {
    type: EntityType.ROCKET
    object: ObjectComponent
}

export type RocketEntity = Entity<RocketComponents>
export type ImmutableRocket = ImmutableEntity<RocketComponents>
