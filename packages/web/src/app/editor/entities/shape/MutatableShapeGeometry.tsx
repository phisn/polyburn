import { Point } from "runtime/src/model/world/Point"
import { BufferGeometry, Float32BufferAttribute, ShapeUtils } from "three"

export class MutatableShapeGeometry extends BufferGeometry {
    update(vertices: Point[]) {
        // check direction of vertices
        if (ShapeUtils.isClockWise(vertices) === false) {
            vertices = vertices.reverse()
        }

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

        for (let i = 0, l = vertices.length; i < l; i++) {
            buffer[i * 3] = vertices[i].x
            buffer[i * 3 + 1] = vertices[i].y
            buffer[i * 3 + 2] = 0

            bufferNormals[i * 3] = 0
            bufferNormals[i * 3 + 1] = 0

            bufferUvs[i * 2] = vertices[i].x
            bufferUvs[i * 2 + 1] = vertices[i].y
        }

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

