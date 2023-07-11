import { EntityType } from "../../core/common/EntityType"
import { FlagEntityModel } from "./FlagEntityModel"
import { Point } from "./Point"

export interface RocketEntityModel {
    type: EntityType.Rocket

    position: Point
    rotation: number
}

export type EntityModel = RocketEntityModel | FlagEntityModel
