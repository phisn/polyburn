import { Rotation } from "@dimforge/rapier2d"
import { Point } from "runtime/src/model/Point"
import { Vector3 } from "three"

export interface InterpolatedComponent {
    // using functions here to abstract away where and how these are retrieved
    // active especially useful to not interpolate sleeping entities. should be
    // a marginal overhead
    currentActive: () => boolean
    currentTranslation: () => Point
    currentRotation: () => Rotation

    position: Vector3
    rotation: number

    newPosition: Vector3
    newRotation: number

    previousPosition: Vector3
    previousRotation: Rotation
}
