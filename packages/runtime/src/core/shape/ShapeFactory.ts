import RAPIER from "@dimforge/rapier2d-compat"

import { EntityType, ShapeModel } from "../../../proto/world"
import { ShapeVertex, bytesToVertices } from "../../model/ShapeModel"
import { RuntimeComponents } from "../RuntimeComponents"
import { RuntimeFactoryContext } from "../RuntimeFactoryContext"

export const newShape = (context: RuntimeFactoryContext<RuntimeComponents>, shape: ShapeModel) => {
    const vertices = bytesToVertices(shape.vertices)
    const [verticesRaw, top, left] = verticesForShape(vertices)

    const body = context.physics.createRigidBody(
        RAPIER.RigidBodyDesc.fixed().setTranslation(left, top),
    )

    const collider = RAPIER.ColliderDesc.polyline(verticesRaw).setCollisionGroups(0x0002_0005)

    if (collider === null) {
        throw new Error("Failed to create collider")
    }

    context.physics.createCollider(collider, body)

    /*
    const vertices = shape.vertices.map(v => ({
        point: { x: v.x, y: v.y },
        color: v.color ?? 0x000000,
    }))
    */

    return context.store.create({
        entityType: EntityType.SHAPE,
        rigidBody: body,
        shape: { vertices },
    })
}

function verticesForShape(vertices: ShapeVertex[]): [Float32Array, number, number] {
    const left = vertices.reduce((acc, vertex) => Math.min(acc, vertex.point.x), Infinity)
    const top = vertices.reduce((acc, vertex) => Math.min(acc, vertex.point.y), Infinity)

    const verticesRaw = new Float32Array(vertices.length * 2 + 2)

    vertices.forEach((vertex, i) => {
        verticesRaw[i * 2] = vertex.point.x - left
        verticesRaw[i * 2 + 1] = vertex.point.y - top
    })

    verticesRaw[verticesRaw.length - 2] = vertices[0].point.x - left
    verticesRaw[verticesRaw.length - 1] = vertices[0].point.y - top

    return [verticesRaw, top, left]
}
