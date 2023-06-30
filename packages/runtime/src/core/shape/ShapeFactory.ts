import RAPIER from "@dimforge/rapier2d-compat"

import { EntityStore } from "../../../../runtime-framework/src"
import { ShapeModel } from "../../model/world/ShapeModel"
import { EntityType } from "../common/EntityType"
import { Meta } from "../common/Meta"
import { RuntimeComponents } from "../RuntimeComponents"

export const newShape = (meta: Meta, store: EntityStore<RuntimeComponents>, shape: ShapeModel) => {
    const [vertices, top, left] = verticesForShape(shape)

    const body = meta.rapier.createRigidBody(
        RAPIER.RigidBodyDesc.fixed()
            .setTranslation(left, top)
    )

    const collider = RAPIER.ColliderDesc.polyline(vertices)

    if (collider === null) {
        throw new Error("Failed to create collider")
    }

    meta.rapier.createCollider(collider, body)

    return store.getState().newEntity({
        entityType: EntityType.Shape,
        rigidBody: body,
        shape: { vertices: shape.vertices }
    })
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
