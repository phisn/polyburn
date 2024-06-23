import { EntityType } from "runtime/proto/world"
import { Point } from "runtime/src/model/point"
import { Behaviors } from "../../behaviors/behaviors"
import { ObjectBehavior } from "../../behaviors/object/object-behavior"
import { entityGraphicRegistry } from "../../graphics-assets/entity-graphic-registry"
import { EntityGraphicType } from "../../graphics-assets/entity-graphic-type"
import { Entity, ImmutableEntity } from "../entity"
import { isPointInsideEntity } from "../is-point-inside-entity"

export function newRocketEntity(relativePosition: Point, rotation: number): RocketBehaviors {
    return {
        type: EntityType.ROCKET,
        object: {
            position: { x: relativePosition.x, y: relativePosition.y },
            rotation: rotation,
            size: () => entityGraphicRegistry[EntityGraphicType.Rocket].size,
            isInside: function (point) {
                return isPointInsideEntity(
                    point,
                    this.position,
                    this.rotation,
                    EntityGraphicType.Rocket,
                )
            },
        },
        group: undefined,
    }
}

export interface RocketBehaviors extends Behaviors {
    type: EntityType.ROCKET
    object: ObjectBehavior
}

export type RocketEntity = Entity<RocketBehaviors>
export type ImmutableRocketEntity = ImmutableEntity<RocketBehaviors>
