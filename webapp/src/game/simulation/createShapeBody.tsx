import RAPIER from "@dimforge/rapier2d-compat"

import { Shape } from "../../model/world/Shape"

export function createShapeBody(shape: Shape, rapierWorld: RAPIER.World) {
    const [vertices, top, left] = verticesForShape(shape)

    const body = rapierWorld.createRigidBody(
        RAPIER.RigidBodyDesc.fixed()
            .setTranslation(left, top)
    )

    const colliderDesc = RAPIER.ColliderDesc.polyline(vertices)

    if (colliderDesc == null) {
        throw new Error("Failed to create collider")
    }

    rapierWorld.createCollider(
        colliderDesc,
        body
    )
}

function verticesForShape(shape: Shape): [ Float32Array, number, number ] {
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