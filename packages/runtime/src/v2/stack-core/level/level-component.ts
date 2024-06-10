import RAPIER from "@dimforge/rapier2d"
import { Point } from "../../../model/point"

export interface LevelComponent {
    captured: boolean
    inCapture: boolean

    camera: {
        topLeft: Point
        bottomRight: Point
    }

    hideFlag: boolean
    flag: Point
    flagRotation: number

    capturePosition: Point
    captureSize: Point

    boundsTL: Point
    boundsBR: Point

    boundsCollider: RAPIER.Collider
    captureCollider: RAPIER.Collider
}
