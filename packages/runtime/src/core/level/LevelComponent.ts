import { Point } from "webapp/src/model/world/Point"

export interface LevelComponent {
    captured: boolean

    camera: {
        topLeft: Point
        bottomRight: Point
    }

    flag: Point
    flagRotation: number
}
