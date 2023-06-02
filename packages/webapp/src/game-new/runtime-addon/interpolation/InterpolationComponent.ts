import { Rotation } from "@dimforge/rapier2d-compat"
import { Vector3 } from "three"

export interface InterpolationComponent {
    position: Vector3
    rotation: number

    newPosition: Vector3
    newRotation: number

    previousPosition: Vector3
    previousRotation: Rotation
}
