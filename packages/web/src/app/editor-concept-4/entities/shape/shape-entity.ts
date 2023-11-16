import { EntityType } from "runtime/proto/world"
import { BaseBehaviors } from "../../components/behavior"
import { ObjectBehavior } from "../../components/object/model"
import { ShapeBehavior } from "../../components/shape/shape-component"
import { Entity, ImmutableEntity } from "../entity"

export interface ShapeComponents extends BaseBehaviors {
    type: EntityType.SHAPE
    shape: ShapeBehavior
    object: ObjectBehavior
}

export type ShapeEntity = Entity<ShapeComponents>
export type ImmutableShape = ImmutableEntity<ShapeComponents>
