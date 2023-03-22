import RAPIER from "@dimforge/rapier2d-compat"

import { FlagEntity } from "../../model/world/Entity"
import { Point } from "../../model/world/Point"

export interface LevelModel {
    unlocked: boolean,
    collider: RAPIER.Collider,
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
            .setTranslation(camera.topLeft.x, camera.topLeft.y)
    )

    const width = camera.bottomRight.x - camera.topLeft.x
    const height = camera.bottomRight.y - camera.topLeft.y

    const colliderDesc = RAPIER.ColliderDesc.polyline(new Float32Array([
        0, 0,
        width, 0,
        width, height,
        0, height,
        0, 0
    ]))

    if (colliderDesc == null) {
        throw new Error("Failed to create collider")
    }

    const collider = rapier.createCollider(
        colliderDesc,
        body
    )

    collider.setEnabled(false)

    return {
        unlocked: false,
        collider,
        camera,
        flag: flag.position,
        flagRotation: flag.rotation
    }
}
