import { EntityModelType } from "./EntityModelType"
import { FlagEntity } from "./FlagModel"
import { Point } from "./Point"

export interface RocketEntityModel {
    type: EntityModelType.Rocket

    position: Point
    rotation: number
}

export interface GreenFlagEntityModel {
    type: EntityModelType.GreenFlag

    position: Point
    rotation: number
}

export type EntityModel = RocketEntityModel | FlagEntity | GreenFlagEntityModel
