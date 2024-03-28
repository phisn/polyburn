import { EntityType } from "runtime/proto/world"
import { Behaviors } from "../../behaviors/behaviors"
import { ObjectBehavior } from "../../behaviors/object/object-behavior"
import { Entity, ImmutableEntity } from "../entity"

export interface RocketBehaviors extends Behaviors {
    type: EntityType.ROCKET
    object: ObjectBehavior
}

export type RocketEntity = Entity<RocketBehaviors>
export type ImmutableRocketEntity = ImmutableEntity<RocketBehaviors>
