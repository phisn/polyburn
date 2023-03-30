import RAPIER from "@dimforge/rapier2d-compat"

import { captureBox, FlagEntity } from "../../model/world/Flag"
import { Point } from "../../model/world/Point"

export interface LevelModel {
    unlocked: boolean,
    collider: RAPIER.Collider,
    captureCollider: RAPIER.Collider,
    camera: {
        topLeft: Point
        bottomRight: Point
    },
    flag: Point
    flagRotation: number
}

export function createLevel(    
    rapier: RAPIER.World, 
    flag: FlagEntity
): LevelModel {
    const camera = {
        topLeft: flag.cameraTopLeft,
        bottomRight: flag.cameraBottomRight
    }

    const body = rapier.createRigidBody(
        RAPIER.RigidBodyDesc.fixed()
    )

    const colliderDesc = RAPIER.ColliderDesc
        .polyline(new Float32Array([
            camera.topLeft.x, camera.topLeft.y,
            camera.topLeft.x, camera.bottomRight.y,
            camera.bottomRight.x, camera.bottomRight.y,
            camera.bottomRight.x, camera.topLeft.y,
            camera.topLeft.x, camera.topLeft.y
        ]))

    if (colliderDesc == null) {
        throw new Error("Failed to create collider")
    }

    const collider = rapier.createCollider(
        colliderDesc,
        body
    )

    collider.setSensor(true)

    const { size, transformed } = captureBox(flag)

    const captureColliderDesc = RAPIER.ColliderDesc.cuboid(size.width, size.height)
        .setTranslation(transformed.x, transformed.y)
        .setRotation(flag.rotation)
        .setSensor(true)

    if (captureColliderDesc == null) {
        throw new Error("Failed to create collider")
    }

    const captureCollider = rapier.createCollider(
        captureColliderDesc
    )

    return {
        unlocked: false,
        collider,
        captureCollider,
        camera,
        flag: flag.position,
        flagRotation: flag.rotation
    }
}
