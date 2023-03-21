import { Point } from "./Point"
import { Size } from "./Size"

export enum EntityType {
    Rocket = "Rocket",
    GreenFlag = "Green Flag",
    RedFlag = "Red Flag",
}

export interface RocketEntity {
    type: EntityType.Rocket

    position: Point
    rotation: number
}

export interface FlagEntity {
    type: EntityType.RedFlag,

    position: Point
    rotation: number

    cameraTopLeft: Point
    cameraBottomRight: Point

    captureLeft: number
    captureRight: number
}

export interface GreenFlagEntity {
    type: EntityType.GreenFlag

    position: Point
    rotation: number
}

export type Entity = RocketEntity | FlagEntity | GreenFlagEntity

export interface EntityRegisterEntry {
    scale: number
    size: Size
    anchor: Point

    src: string

    // Idea is that entities consist of more than just position and rotation. 
    // The creation of an entity like camera is dependent on the position
    // because we want to set the initial camera somewhere around the initial position.
    // Addtionally, we dont want the camera position to be nullable so we need to 
    // create it now and not change after moving it later (small flag adjustments
    // should not change the camera position).  
    transformOrCreate: (position: Point, rotation: number, entity: Entity | null) => Entity
}

export interface EntityRegistry {
    [key: string]: EntityRegisterEntry
}
