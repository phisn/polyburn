import { Point } from "runtime/src/model/point"
import { ShapeVertex } from "runtime/src/model/world/shape-model"
import { BufferGeometry, Color, Float32BufferAttribute, ShapeUtils } from "three"

function IterateInOrder(vertices: Point[], callback: (i: number, vertex: Point) => void) {
    for (let i = 0; i < vertices.length; i++) {
        callback(i, vertices[i])
    }
}

function IterateInReverseOrder(vertices: Point[], callback: (i: number, vertex: Point) => void) {
    for (let i = vertices.length - 1; i >= 0; i--) {
        callback(i, vertices[i])
    }
}

export class MutatableShapeGeometry extends BufferGeometry {
    constructor(shapeVertices?: ShapeVertex[]) {
        super()

        if (shapeVertices) {
            this.update(shapeVertices)
        }
    }

    update(shapeVertices: ShapeVertex[]) {
        const vertices = shapeVertices.map(vertex => vertex.position)

        // check direction of vertices
        const iterate = ShapeUtils.isClockWise(vertices) ? IterateInOrder : IterateInReverseOrder

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

        const color = new Color()
        iterate(vertices, (i, vertex) => {
            buffer[i * 3 + 0] = vertex.x
            buffer[i * 3 + 1] = vertex.y
            buffer[i * 3 + 2] = 0

            color.r = ((shapeVertices[i].color >> 16) & 0xff) / 255
            color.g = ((shapeVertices[i].color >> 8) & 0xff) / 255
            color.b = ((shapeVertices[i].color >> 0) & 0xff) / 255

            color.convertSRGBToLinear()

            bufferColors[i * 3 + 0] = color.r
            bufferColors[i * 3 + 1] = color.g
            bufferColors[i * 3 + 2] = color.b
        })

        this.setIndex(indices)

        this.setAttribute("position", new Float32BufferAttribute(buffer, 3))
        this.setAttribute("color", new Float32BufferAttribute(bufferColors, 3))

        this.attributes.color.needsUpdate = true
        this.attributes.position.needsUpdate = true
    }
}
