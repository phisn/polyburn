import RAPIER from "@dimforge/rapier2d-compat"

import { captureBox,FlagEntity } from "../../../../model/world/FlagModel"
import { Point } from "../../../../model/world/Point"
import { ColliderType } from "../../ColliderType"
import { RuntimeMetaState } from "../../RuntimeState"

export class RuntimeLevel {
    boundsCollider: RAPIER.Collider

    captured = false
    captureCollider: RAPIER.Collider
    
    camera: {
        topLeft: Point
        bottomRight: Point
    }
    
    flag: Point
    flagRotation: number

    constructor(    
        state: RuntimeMetaState,
        flag: FlagEntity
    ) {
        this.flag = flag.position
        this.flagRotation = flag.rotation

        this.camera = {
            topLeft: flag.cameraTopLeft,
            bottomRight: flag.cameraBottomRight
        }
    
        const body = state.rapier.createRigidBody(
            RAPIER.RigidBodyDesc.fixed()
        )
    
        const colliderDesc = RAPIER.ColliderDesc
            .polyline(new Float32Array([
                this.camera.topLeft.x, this.camera.topLeft.y,
                this.camera.topLeft.x, this.camera.bottomRight.y,
                this.camera.bottomRight.x, this.camera.bottomRight.y,
                this.camera.bottomRight.x, this.camera.topLeft.y,
                this.camera.topLeft.x, this.camera.topLeft.y
            ]))
    
        if (colliderDesc == null) {
            throw new Error("Failed to create collider")
        }
    
        this.boundsCollider = state.rapier.createCollider(
            colliderDesc,
            body
        )
    
        this.boundsCollider.setSensor(true)
    
        const { size, transformed } = captureBox(flag)
    
        const captureColliderDesc = RAPIER.ColliderDesc.cuboid(size.width, size.height)
            .setTranslation(transformed.x, transformed.y)
            .setRotation(flag.rotation)
            .setSensor(true)
    
        if (captureColliderDesc == null) {
            throw new Error("Failed to create collider")
        }
    
        this.captureCollider = state.rapier.createCollider(
            captureColliderDesc
        )
    
        state.handleToEntityType.set(this.boundsCollider.handle, ColliderType.LevelBounds)
        state.handleToEntityType.set(this.captureCollider.handle, ColliderType.LevelCapture)
    }
    
    unlockLevel() {
        this.captured = true
        this.boundsCollider.setSensor(false)
    }
    
    lockLevel() {
        this.boundsCollider.setSensor(true)
    }
}
