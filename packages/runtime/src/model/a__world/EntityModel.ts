import { EntityType } from "../../core/common/EntityType"
import { Point } from "../Point"
import { FlagEntityModel } from "./FlagEntityModel"

export interface RocketEntityModel {
    type: EntityType.ROCKET

    position: Point
    rotation: number
}

export type EntityModel = RocketEntityModel | FlagEntityModel
