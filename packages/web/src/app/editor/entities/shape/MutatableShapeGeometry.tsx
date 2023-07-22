import {
    BufferGeometry,
    Float32BufferAttribute,
    ShapeUtils,
    Vector2,
} from "three"
import { ShapeState } from "./ShapeState"

function IterateInOrder(
    vertices: Vector2[],
    callback: (i: number, vertex: Vector2) => void,
) {
    for (let i = 0; i < vertices.length; i++) {
        callback(i, vertices[i])
    }
}

function IterateInReverseOrder(
    vertices: Vector2[],
    callback: (i: number, vertex: Vector2) => void,
) {
    for (let i = vertices.length - 1; i >= 0; i--) {
        callback(i, vertices[i])
    }
}

export class MutatableShapeGeometry extends BufferGeometry {
    update(shape: ShapeState) {
        const vertices = shape.vertices.map(vertex => vertex.position)

        // check direction of vertices
        const iterate = ShapeUtils.isClockWise(vertices)
            ? IterateInOrder
            : IterateInReverseOrder

        const faces = ShapeUtils.triangulateShape(vertices, [])

        const indices = []
        for (let i = 0, l = faces.length; i < l; i++) {
            const face = faces[i]

            const a = face[0]
            const b = face[1]
            const c = face[2]

            indices.push(a, b, c)
        }

        const buffer = new Float32Array(vertices.length * 3)
        const bufferColors = new Float32Array(vertices.length * 3)

        iterate(vertices, (i, vertex) => {
            buffer[i * 3 + 0] = vertex.x
            buffer[i * 3 + 1] = vertex.y
            buffer[i * 3 + 2] = 0

            bufferColors[i * 3 + 0] = shape.vertices[i].color.r / 255
            bufferColors[i * 3 + 1] = shape.vertices[i].color.g / 255
            bufferColors[i * 3 + 2] = shape.vertices[i].color.b / 255
        })

        this.setIndex(indices)

        this.setAttribute("position", new Float32BufferAttribute(buffer, 3))
        this.setAttribute("color", new Float32BufferAttribute(bufferColors, 3))

        this.attributes.color.needsUpdate = true
        this.attributes.position.needsUpdate = true
    }
}
