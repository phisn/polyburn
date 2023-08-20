import { Point } from "./Point"

export interface ShapeVertex {
    point: Point
    color: number
}

export function verticesToBytes(vertices: ShapeVertex[]) {
    const u8 = new Uint8Array(vertices.length * 12)
    const view = new DataView(u8.buffer)

    for (let i = 0; i < vertices.length; i++) {
        view.setFloat32(i * 12, vertices[i].point.x, true)
        view.setFloat32(i * 12 + 4, vertices[i].point.y, true)
        view.setUint32(i * 12 + 8, vertices[i].color, true)
    }

    return u8
}

export function bytesToVertices(bytes: Uint8Array) {
    const vertices: ShapeVertex[] = []
    const view = new DataView(
        bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    )

    for (let i = 0; i < bytes.length; i += 12) {
        vertices.push({
            point: {
                x: view.getFloat32(i, true),
                y: view.getFloat32(i + 4, true),
            },
            color: view.getUint32(i + 8, true),
        })
    }

    return vertices
}

function color32ToColor16(color: number): number {
    return (((color >> 19) & 0x1f) << 11) | (((color >> 10) & 0x1f) << 6) | ((color >> 3) & 0x1f)
}

function color16ToColor32(color: number): number {
    return (((color >> 11) & 0x1f) << 19) | (((color >> 6) & 0x1f) << 10) | ((color & 0x1f) << 3)
}
