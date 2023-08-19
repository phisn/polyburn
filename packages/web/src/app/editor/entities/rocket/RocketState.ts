import { EntityType } from "runtime/proto/world"
import { EntityStateBase } from "../../models/EntityStateBase"

export interface RocketState extends EntityStateBase {
    type: EntityType.ROCKET

    position: { x: number; y: number }
    rotation: number
}
