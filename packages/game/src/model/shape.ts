import RAPIER from "@dimforge/rapier2d"
import { f16round, getFloat16, setFloat16 } from "@petamoriken/float16"

export interface ShapeVertex {
    position: RAPIER.Vector2
    color: number
}

export function createShapeBody(
    rapier: typeof RAPIER,
    world: RAPIER.World,
    vertices: ShapeVertex[],
) {
    const [verticesRaw, top, left] = verticesForShape(vertices)

    const body = world.createRigidBody(rapier.RigidBodyDesc.fixed().setTranslation(left, top))

    const collider = rapier.ColliderDesc.polyline(verticesRaw).setCollisionGroups(0x00_02_00_05)

    if (collider === null) {
        throw new Error("Failed to create collider")
    }

    world.createCollider(collider, body)

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

export function verticesToBytes(vertices: ShapeVertex[]) {
    const u8 = new Uint8Array(4 + vertices.length * 8)
    const view = new DataView(u8.buffer)

    view.setFloat32(0, vertices[0].position.x, true)
    view.setFloat32(4, vertices[0].position.y, true)

    const aggregated = {
        x: vertices[0].position.x,
        y: vertices[0].position.y,
    }

    view.setUint32(8, vertices[0].color, true)

    for (let vertexIndex = 1; vertexIndex < vertices.length; vertexIndex++) {
        const roundx = f16round(vertices[vertexIndex].position.x - aggregated.x)
        const roundy = f16round(vertices[vertexIndex].position.y - aggregated.y)

        aggregated.x += roundx
        aggregated.y += roundy

        setFloat16(view, 4 + vertexIndex * 8, roundx, true)
        setFloat16(view, 4 + vertexIndex * 8 + 2, roundy, true)

        view.setUint32(4 + vertexIndex * 8 + 4, vertices[vertexIndex].color, true)
    }

    return u8
}

export function bytesToVertices(rapier: typeof RAPIER, bytes: Uint8Array) {
    const vertices: ShapeVertex[] = []

    const view = new DataView(
        bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    )

    vertices.push({
        position: {
            x: view.getFloat32(0, true),
            y: view.getFloat32(4, true),
        },
        color: view.getUint32(8, true),
    })

    const aggregated = {
        x: vertices[0].position.x,
        y: vertices[0].position.y,
    }

    for (let byteCount = 12; byteCount < bytes.byteLength; byteCount += 8) {
        aggregated.x += getFloat16(view, byteCount, true)
        aggregated.y += getFloat16(view, byteCount + 2, true)

        vertices.push({
            position: new rapier.Vector2(aggregated.x, aggregated.y),
            color: view.getUint32(byteCount + 4, true),
        })
    }

    return vertices
}
