import RAPIER from "@dimforge/rapier2d-compat"

import { ShapeModel } from "../../../../model/world/ShapeModel"
import { ColliderType } from "../../ColliderType"
import { RuntimeMetaState } from "../../RuntimeState"

export function createShape(
    state: RuntimeMetaState,
    shape: ShapeModel
) {
    const [vertices, top, left] = verticesForShape(shape)

    const body = state.rapier.createRigidBody(
        RAPIER.RigidBodyDesc.fixed()
            .setTranslation(left, top)
    )

    const colliderDesc = RAPIER.ColliderDesc.polyline(vertices)

    if (colliderDesc == null) {
        throw new Error("Failed to create collider")
    }

    state.handleToEntityType.set(body.handle, ColliderType.Shape)

    state.rapier.createCollider(
        colliderDesc,
        body
    )
}

function verticesForShape(shape: ShapeModel): [ Float32Array, number, number ] {
    const left = shape.vertices.reduce((acc, vertex) => Math.min(acc, vertex.x), Infinity)
    const top  = shape.vertices.reduce((acc, vertex) => Math.min(acc, vertex.y), Infinity)

    const vertices = new Float32Array(shape.vertices.length * 2 + 2)

    shape.vertices.forEach((vertex, i) => {
        vertices[i * 2] = vertex.x - left
        vertices[i * 2 + 1] = vertex.y - top
    })

    vertices[vertices.length - 2] = shape.vertices[0].x - left
    vertices[vertices.length - 1] = shape.vertices[0].y - top

    return [ vertices, top, left ]
}