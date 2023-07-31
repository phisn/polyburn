import RAPIER from "@dimforge/rapier2d-compat"

import { captureBox, FlagEntityModel } from "../../model/world/FlagEntityModel"
import { EntityType } from "../common/EntityType"
import { RuntimeComponents } from "../RuntimeComponents"
import { RuntimeFactoryContext } from "../RuntimeFactoryContext"

export const newLevel = (
    factoryContext: RuntimeFactoryContext<RuntimeComponents>,
    flag: FlagEntityModel,
) => {
    const level = {
        captured: false,
        inCapture: false,

        camera: {
            topLeft: flag.cameraTopLeft,
            bottomRight: flag.cameraBottomRight,
        },

        hideFlag: false,
        flag: flag.position,
        flagRotation: flag.rotation,
    }

    const body = factoryContext.physics.createRigidBody(RAPIER.RigidBodyDesc.fixed())

    const colliderDesc = RAPIER.ColliderDesc.polyline(
        new Float32Array([
            level.camera.topLeft.x,
            level.camera.topLeft.y,
            level.camera.topLeft.x,
            level.camera.bottomRight.y,
            level.camera.bottomRight.x,
            level.camera.bottomRight.y,
            level.camera.bottomRight.x,
            level.camera.topLeft.y,
            level.camera.topLeft.x,
            level.camera.topLeft.y,
        ]),
    )

    if (colliderDesc == null) {
        throw new Error("Failed to create collider")
    }

    const boundsCollider = factoryContext.physics.createCollider(colliderDesc, body)

    boundsCollider.setSensor(true)

    const { size, transformed } = captureBox(flag)

    const captureColliderDesc = RAPIER.ColliderDesc.cuboid(size.width, size.height)
        .setTranslation(transformed.x, transformed.y)
        .setRotation(flag.rotation)
        .setSensor(true)

    if (captureColliderDesc == null) {
        throw new Error("Failed to create collider")
    }

    const captureCollider = factoryContext.physics.createCollider(captureColliderDesc, body)

    return factoryContext.store.create({
        level: {
            ...level,
            boundsCollider,
            captureCollider,
        },

        entityType: EntityType.Level,
        rigidBody: body,
    })
}
