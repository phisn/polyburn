import { Shape, Vertex } from "./World"
import * as THREE from "three"

export interface EditorShape extends Shape {
    geometry: THREE.BufferGeometry
    mesh: THREE.Mesh
    material: THREE.MeshBasicMaterial

    vertices: Vertex[]
}

export function mutateVertices(shape: EditorShape, mutate: (shape: Vertex[]) => Vertex[]) {
    const newShape = { ...shape, vertices: mutate(shape.vertices) }
    const verticesRaw = new Float32Array(newShape.vertices.length * 3)

    for (let i = 0; i < newShape.vertices.length; ++i) {
        verticesRaw[i * 3 + 0] = newShape.vertices[i].x
        verticesRaw[i * 3 + 1] = newShape.vertices[i].y
        verticesRaw[i * 3 + 2] = -1
    }

    newShape.geometry.setAttribute("position", new THREE.BufferAttribute(verticesRaw, 3))
    newShape.geometry.attributes.position.needsUpdate = true

    return newShape
}

export function newEditorShape(vertices: Vertex[]): EditorShape {
    const geometry = new THREE.BufferGeometry()
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff })
    const mesh = new THREE.Mesh(geometry, material)

    const shape: EditorShape = {
        vertices,
        geometry,
        mesh,
        material
    }

    return mutateVertices(shape, v => v)
}

export interface EditorWorld {
    shapes: EditorShape[]
}

export function mutateShapeAt(world: EditorWorld, index: number, mutate: (shape: EditorShape) => EditorShape) {
    return { ...world, shapes: world.shapes.map((s, i) => i === index ? mutate(s) : s) }
}

export function insertShape(world: EditorWorld, shape: EditorShape) {
    return { ...world, shapes: [...world.shapes, shape] }
}

export function removeShape(world: EditorWorld, index: number) {
    return { ...world, shapes: world.shapes.filter((_, i) => i !== index) }
}
