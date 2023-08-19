import RAPIER from "@dimforge/rapier2d-compat"
import { EntityType, LevelModel } from "../../../proto/world"
import { captureBox } from "../../model/LevelModel"
import { RuntimeComponents } from "../RuntimeComponents"
import { RuntimeFactoryContext } from "../RuntimeFactoryContext"

export const newLevel = (
    factoryContext: RuntimeFactoryContext<RuntimeComponents>,
    level: LevelModel,
) => {
    const levelEntity = {
        captured: false,
        inCapture: false,

        camera: {
            topLeft: { x: level.cameraTopLeftX, y: level.cameraTopLeftY },
            bottomRight: { x: level.cameraBottomRightX, y: level.cameraBottomRightY },
        },

        hideFlag: false,
        flag: { x: level.positionX, y: level.positionY },
        flagRotation: level.rotation,
    }

    const body = factoryContext.physics.createRigidBody(RAPIER.RigidBodyDesc.fixed())

    const colliderDesc = RAPIER.ColliderDesc.polyline(
        new Float32Array([
            levelEntity.camera.topLeft.x,
            levelEntity.camera.topLeft.y,
            levelEntity.camera.topLeft.x,
            levelEntity.camera.bottomRight.y,
            levelEntity.camera.bottomRight.x,
            levelEntity.camera.bottomRight.y,
            levelEntity.camera.bottomRight.x,
            levelEntity.camera.topLeft.y,
            levelEntity.camera.topLeft.x,
            levelEntity.camera.topLeft.y,
        ]),
    )

    if (colliderDesc == null) {
        throw new Error("Failed to create collider")
    }

    const boundsCollider = factoryContext.physics.createCollider(colliderDesc, body)

    boundsCollider.setSensor(true)

    const { size, transformed } = captureBox(level)

    const captureColliderDesc = RAPIER.ColliderDesc.cuboid(size.width, size.height)
        .setTranslation(transformed.x, transformed.y)
        .setRotation(level.rotation)
        .setSensor(true)

    if (captureColliderDesc == null) {
        throw new Error("Failed to create collider")
    }

    const captureCollider = factoryContext.physics.createCollider(captureColliderDesc, body)

    return factoryContext.store.create({
        level: {
            ...levelEntity,
            boundsCollider,
            captureCollider,
        },

        entityType: EntityType.LEVEL,
        rigidBody: body,
    })
}
