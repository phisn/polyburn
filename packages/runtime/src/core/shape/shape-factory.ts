import RAPIER from "@dimforge/rapier2d"

import { EntityType, ShapeModel } from "../../../proto/world"
import { ShapeVertex, bytesToVertices } from "../../model/world/shape-model"
import { RuntimeComponents } from "../runtime-components"
import { RuntimeFactoryContext } from "../runtime-factory-context"

export const newShape = (context: RuntimeFactoryContext<RuntimeComponents>, shape: ShapeModel) => {
    const vertices = bytesToVertices(context.rapier, shape.vertices)
    const rigidBody = createShapeRigidBody(context.rapier, context.physics, vertices)

    return context.store.create({
        entityType: EntityType.SHAPE,
        rigidBody,
        shape: { vertices },
    })
}

export function createShapeRigidBody(
    rapier: typeof RAPIER,
    physics: RAPIER.World,
    vertices: ShapeVertex[],
) {
    const [verticesRaw, top, left] = verticesForShape(vertices)

    const body = physics.createRigidBody(rapier.RigidBodyDesc.fixed().setTranslation(left, top))

    const collider = rapier.ColliderDesc.polyline(verticesRaw).setCollisionGroups(0x00_02_00_05)

    if (collider === null) {
        throw new Error("Failed to create collider")
    }

    physics.createCollider(collider, body)

    return body
}

export function verticesForShape(vertices: ShapeVertex[]): [Float32Array, number, number] {
    const left = vertices.reduce(
        (a, vertex) => Math.min(a, vertex.position.x),
        Number.POSITIVE_INFINITY,
    )

    const top = vertices.reduce(
        (a, vertex) => Math.min(a, vertex.position.y),
        Number.POSITIVE_INFINITY,
    )

    const verticesRaw = new Float32Array(vertices.length * 2 + 2)

    for (const [index, vertex] of vertices.entries()) {
        verticesRaw[index * 2] = vertex.position.x - left
        verticesRaw[index * 2 + 1] = vertex.position.y - top
    }

    verticesRaw[verticesRaw.length - 2] = vertices[0].position.x - left
    verticesRaw[verticesRaw.length - 1] = vertices[0].position.y - top

    return [verticesRaw, top, left]
}
