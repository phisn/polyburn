import { EntityType, LevelModel } from "../../../proto/world"
import { captureBox } from "../../model/world/level-model"
import { RuntimeComponents } from "../runtime-components"
import { RuntimeFactoryContext } from "../runtime-factory-context"

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

    const body = factoryContext.physics.createRigidBody(
        new factoryContext.rapier.RigidBodyDesc(factoryContext.rapier.RigidBodyType.Fixed),
    )

    console.log(body.handle)

    const colliderDesc = factoryContext.rapier.ColliderDesc.polyline(
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

    if (colliderDesc === null) {
        throw new Error("Failed to create collider")
    }

    const boundsCollider = factoryContext.physics.createCollider(colliderDesc, body)
    boundsCollider.setSensor(true)

    const { size, transformed } = captureBox(level)

    const captureColliderDesc = factoryContext.rapier.ColliderDesc.cuboid(size.width, size.height)
        .setTranslation(transformed.x, transformed.y)
        .setRotation(level.rotation)
        .setSensor(true)

    if (captureColliderDesc === null) {
        throw new Error("Failed to create collider")
    }

    const captureCollider = factoryContext.physics.createCollider(captureColliderDesc, body)

    return factoryContext.store.create({
        level: {
            ...levelEntity,

            boundsCollider,
            captureCollider,

            capturePosition: { x: transformed.x, y: transformed.y },
            captureSize: { x: size.width, y: size.height },

            boundsTL: { x: levelEntity.camera.topLeft.x, y: levelEntity.camera.topLeft.y },
            boundsBR: { x: levelEntity.camera.bottomRight.x, y: levelEntity.camera.bottomRight.y },
        },

        entityType: EntityType.LEVEL,
        rigidBody: body,
    })
}
