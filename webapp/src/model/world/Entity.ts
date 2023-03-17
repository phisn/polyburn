import { Point } from "./Point"
import { Size } from "./Size"

export enum EntityType {
    Rocket = "Rocket",
    GreenFlag = "Green Flag",
    RedFlag = "Red Flag",
}

export interface Entity {
    position: Point
    rotation: number
    type: EntityType
}

export interface EntityRegisterEntry {
    scale: number
    size: Size
    anchor: Point

    src: string
}

export interface EntityRegistry {
    [key: string]: EntityRegisterEntry
}
