import { EntityType } from "game/proto/world"
import { Behaviors } from "../../behaviors/behaviors"
import { ObjectBehavior } from "../../behaviors/object/object-behavior"
import { ShapeBehavior } from "../../behaviors/shape/shape-model"
import { Entity, ImmutableEntity } from "../entity"

export interface ShapeComponents extends Behaviors {
    type: EntityType.SHAPE
    shape: ShapeBehavior
    object: ObjectBehavior
}

export type ShapeEntity = Entity<ShapeComponents>
export type ImmutableShape = ImmutableEntity<ShapeComponents>
