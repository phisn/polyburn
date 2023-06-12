import RAPIER from "@dimforge/rapier2d-compat"

import { EntityStore } from "../../../../runtime-framework/src"
import { captureBox, FlagEntityModel } from "../../model/world/FlagEntityModel"
import { EntityType } from "../EntityType"
import { Meta } from "../Meta"
import { RuntimeComponents } from "../RuntimeComponents"
import { LevelComponent } from "./LevelComponent"

export const newLevel = (meta: Meta, store: EntityStore<RuntimeComponents>, flag: FlagEntityModel) => {
    const level: LevelComponent = {
        captured: false,

        camera: {
            topLeft: flag.cameraTopLeft,
            bottomRight: flag.cameraBottomRight
        },

        flag: flag.position,
        flagRotation: flag.rotation
    }

    const body = meta.rapier.createRigidBody(
        RAPIER.RigidBodyDesc.fixed()
    )

    const colliderDesc = RAPIER.ColliderDesc
        .polyline(new Float32Array([
            level.camera.topLeft.x, level.camera.topLeft.y,
            level.camera.topLeft.x, level.camera.bottomRight.y,
            level.camera.bottomRight.x, level.camera.bottomRight.y,
            level.camera.bottomRight.x, level.camera.topLeft.y,
            level.camera.topLeft.x, level.camera.topLeft.y
        ]))

    if (colliderDesc == null) {
        throw new Error("Failed to create collider")
    }

    const boundsCollider = meta.rapier.createCollider(
        colliderDesc,
        body
    )

    boundsCollider.setSensor(true)

    const { size, transformed } = captureBox(flag)

    const captureColliderDesc = RAPIER.ColliderDesc.cuboid(size.width, size.height)
        .setTranslation(transformed.x, transformed.y)
        .setRotation(flag.rotation)
        .setSensor(true)

    if (captureColliderDesc == null) {
        throw new Error("Failed to create collider")
    }

    meta.rapier.createCollider(
        captureColliderDesc,
        body
    )

    return store.getState().newEntity({
        level,
        
        entityType: EntityType.Level,
        collisionEventListener: {},
        rigidBody: body,
    })
}