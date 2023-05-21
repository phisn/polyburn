import { EntityType } from "./EntityType"
import { FlagEntity } from "./FlagModel"
import { Point } from "./Point"

export interface RocketEntityModel {
    type: EntityType.Rocket

    position: Point
    rotation: number
}

export interface GreenFlagEntityModel {
    type: EntityType.GreenFlag

    position: Point
    rotation: number
}

export type EntityModel = RocketEntityModel | FlagEntity | GreenFlagEntityModel
