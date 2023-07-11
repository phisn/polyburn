import RAPIER from "@dimforge/rapier2d-compat"

import { ShapeModel } from "../../model/world/ShapeModel"
import { EntityType } from "../common/EntityType"
import { RuntimeComponents } from "../RuntimeComponents"
import { RuntimeFactoryContext } from "../RuntimeFactoryContext"

export const newShape = (
    context: RuntimeFactoryContext<RuntimeComponents>,
    shape: ShapeModel,
) => {
    const [vertices, top, left] = verticesForShape(shape)

    const body = context.physics.createRigidBody(
        RAPIER.RigidBodyDesc.fixed().setTranslation(left, top),
    )

    const collider =
        RAPIER.ColliderDesc.polyline(vertices).setCollisionGroups(0x0002_0005)

    if (collider === null) {
        throw new Error("Failed to create collider")
    }

    context.physics.createCollider(collider, body)

    return context.store.create({
        entityType: EntityType.Shape,
        rigidBody: body,
        shape: { vertices: shape.vertices },
    })
}

function verticesForShape(shape: ShapeModel): [Float32Array, number, number] {
    const left = shape.vertices.reduce(
        (acc, vertex) => Math.min(acc, vertex.x),
        Infinity,
    )
    const top = shape.vertices.reduce(
        (acc, vertex) => Math.min(acc, vertex.y),
        Infinity,
    )

    const vertices = new Float32Array(shape.vertices.length * 2 + 2)

    shape.vertices.forEach((vertex, i) => {
        vertices[i * 2] = vertex.x - left
        vertices[i * 2 + 1] = vertex.y - top
    })

    vertices[vertices.length - 2] = shape.vertices[0].x - left
    vertices[vertices.length - 1] = shape.vertices[0].y - top

    return [vertices, top, left]
}
