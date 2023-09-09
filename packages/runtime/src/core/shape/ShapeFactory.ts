import RAPIER from "@dimforge/rapier2d"

import { EntityType, ShapeModel } from "../../../proto/world"
import { ShapeVertex, bytesToVertices } from "../../model/world/ShapeModel"
import { RuntimeComponents } from "../RuntimeComponents"
import { RuntimeFactoryContext } from "../RuntimeFactoryContext"

export const newShape = (context: RuntimeFactoryContext<RuntimeComponents>, shape: ShapeModel) => {
    const vertices = bytesToVertices(shape.vertices)
    const rigidBody = createShapeRigidBody(context.physics, vertices)

    return context.store.create({
        entityType: EntityType.SHAPE,
        rigidBody,
        shape: { vertices },
    })
}

export function createShapeRigidBody(physics: RAPIER.World, vertices: ShapeVertex[]) {
    const [verticesRaw, top, left] = verticesForShape(vertices)

    const body = physics.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(left, top))

    const collider = RAPIER.ColliderDesc.polyline(verticesRaw).setCollisionGroups(0x0002_0005)

    if (collider === null) {
        throw new Error("Failed to create collider")
    }

    physics.createCollider(collider, body)

    return body
}

export function verticesForShape(vertices: ShapeVertex[]): [Float32Array, number, number] {
    const left = vertices.reduce((acc, vertex) => Math.min(acc, vertex.position.x), Infinity)
    const top = vertices.reduce((acc, vertex) => Math.min(acc, vertex.position.y), Infinity)

    const verticesRaw = new Float32Array(vertices.length * 2 + 2)

    vertices.forEach((vertex, i) => {
        verticesRaw[i * 2] = vertex.position.x - left
        verticesRaw[i * 2 + 1] = vertex.position.y - top
    })

    verticesRaw[verticesRaw.length - 2] = vertices[0].position.x - left
    verticesRaw[verticesRaw.length - 1] = vertices[0].position.y - top

    return [verticesRaw, top, left]
}
