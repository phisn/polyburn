import { EntityType } from "runtime/proto/world"
import { BaseBehaviors } from "../../components/behavior"
import { ObjectBehavior } from "../../components/object/model"
import { Entity, ImmutableEntity } from "../entity"

export interface RocketBehaviors extends BaseBehaviors {
    type: EntityType.ROCKET
    object: ObjectBehavior
}

export type RocketEntity = Entity<RocketBehaviors>
export type ImmutableRocket = ImmutableEntity<RocketBehaviors>
