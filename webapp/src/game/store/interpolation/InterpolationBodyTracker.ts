import RAPIER from "@dimforge/rapier2d-compat"
import { MathUtils, Vector3 } from "three"

const interpolationDeltaThreshold = 1

export class InterpolationBodyTracker {
    private previousRotation: number
    private newRotation: number

    private previousPosition: Vector3
    private newPosition: Vector3

    private lerpVector = new Vector3()
    
    constructor(
        private readonly body: RAPIER.RigidBody
    ) { 
        this.previousRotation = body.rotation()
        this.newRotation = body.rotation()

        this.previousPosition = new Vector3(
            body.translation().x,
            body.translation().y,
            0
        )

        this.newPosition = this.previousPosition.clone()
    }

    public now(delta: number) {
        if (this.body.isSleeping() === false) {
            return {
                position: this.newPosition,
                rotation: this.newRotation
            }
        }

        this.lerpVector.set(
            MathUtils.lerp(
                this.previousPosition.x, 
                this.newPosition.x,
                delta
            ),
            MathUtils.lerp(
                this.previousPosition.y,
                this.newPosition.y,
                delta
            ),
            0
        )

        const lerpRotation = MathUtils.lerp(
            this.previousRotation,
            this.newRotation,
            delta
        )

        return {
            position: this.lerpVector,
            rotation: lerpRotation
        }
    }

    public next() {
        if (this.body.isSleeping()) {
            return
        }

        const position = this.body.translation()
        const rotation = this.body.rotation()
        
        console.log(`new position: ${position.x}, ${position.y}`)

        const positionDelta = Math.sqrt(
            Math.pow(position.x - this.previousPosition.x, 2) +
            Math.pow(position.y - this.previousPosition.y, 2)
        )
            
        this.previousRotation = this.newRotation
        this.newRotation = rotation

        this.previousPosition.set(
            this.newPosition.x,
            this.newPosition.y, 0)

        this.newPosition.set(
            position.x,
            position.y, 0)

        if (positionDelta > interpolationDeltaThreshold) {
            this.previousRotation = rotation

            this.previousPosition.set(
                position.x,
                position.y, 0)
        }
    }
}
