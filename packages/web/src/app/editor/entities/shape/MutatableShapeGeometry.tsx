import {
    BufferGeometry,
    Float32BufferAttribute,
    ShapeUtils,
    Vector2,
} from "three"

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
    update(vertices: Vector2[]) {
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
        const bufferNormals = new Float32Array(vertices.length * 3)
        const bufferUvs = new Float32Array(vertices.length * 2)

        iterate(vertices, (i, vertex) => {
            buffer[i * 3] = vertices[i].x
            buffer[i * 3 + 1] = vertices[i].y
            buffer[i * 3 + 2] = 0

            bufferNormals[i * 3] = 0
            bufferNormals[i * 3 + 1] = 0

            bufferUvs[i * 2] = vertices[i].x
            bufferUvs[i * 2 + 1] = vertices[i].y
        })

        this.setIndex(indices)

        this.setAttribute("position", new Float32BufferAttribute(buffer, 3))
        this.setAttribute(
            "normal",
            new Float32BufferAttribute(bufferNormals, 3),
        )
        this.setAttribute("uv", new Float32BufferAttribute(bufferUvs, 2))

        this.attributes.position.needsUpdate = true
    }
}
