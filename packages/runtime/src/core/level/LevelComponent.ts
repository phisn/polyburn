import RAPIER from "@dimforge/rapier2d-compat"
import { Point } from "../../model/Point"

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

    boundsCollider: RAPIER.Collider
    captureCollider: RAPIER.Collider
}
