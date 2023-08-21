import { Vector2 } from "@dimforge/rapier2d-compat"
import { f16round, getFloat16, setFloat16 } from "@petamoriken/float16"

export interface ShapeVertex {
    position: Vector2
    color: number
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

    for (let i = 1; i < vertices.length; i++) {
        const roundx = f16round(vertices[i].position.x - aggregated.x)
        const roundy = f16round(vertices[i].position.y - aggregated.y)

        aggregated.x += roundx
        aggregated.y += roundy

        setFloat16(view, 4 + i * 8, roundx, true)
        setFloat16(view, 4 + i * 8 + 2, roundy, true)

        view.setUint32(4 + i * 8 + 4, vertices[i].color, true)
    }

    return u8
}

export function bytesToVertices(bytes: Uint8Array) {
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

    for (let i = 12; i < bytes.byteLength; i += 8) {
        aggregated.x += getFloat16(view, i, true)
        aggregated.y += getFloat16(view, i + 2, true)

        vertices.push({
            position: new Vector2(aggregated.x, aggregated.y),
            color: view.getUint32(i + 4, true),
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
