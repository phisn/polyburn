import { Shape, Vertex } from "./World"
import * as THREE from "three"

export class EditorShape {
    private vertices: Vertex[] = []

    private geometry: THREE.ShapeGeometry
    private mesh: THREE.Mesh
    private material: THREE.MeshBasicMaterial

    constructor(vertices: Vertex[]) {
        this.vertices = vertices

        this.geometry = new THREE.ShapeGeometry()
        this.material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
        this.mesh = new THREE.Mesh(this.geometry, this.material).translateZ(-1)

        this.updateGeometry()
    }

    public mutateVertices(mutate: (shape: Vertex[]) => Vertex[]) {
        this.vertices = mutate(this.vertices)
        this.updateGeometry()
    }

    public getModel(): Shape {
        return {
            vertices: this.vertices,
        }
    }

    public getMesh() { 
        return this.mesh 
    }

    private updateGeometry() {
        const newShape = new THREE.Shape()

        newShape.setFromPoints(
            this.vertices.map(({ x, y }) => new THREE.Vector2(x, y))
        )

        this.geometry = new THREE.ShapeGeometry(newShape)
        this.mesh.geometry = this.geometry
    }
}

export class EditorWorld {
    private shapes: EditorShape[] = []
    private scene: THREE.Scene

    constructor(scene: THREE.Scene) {
        this.shapes = []
        this.scene = scene
    }

    public mutateShapeAt(index: number, mutate: (shape: EditorShape) => void) {
        if (index < 0 || index >= this.shapes.length) {
            throw new Error("Invalid shape index")
        }

        mutate(this.shapes[index])
        return this
    }

    public insertShape(shape: EditorShape) {
        this.scene.add(shape.getMesh())
        this.shapes.push(shape)
        return this
    }

    public removeShape(index: number) {
        if (index < 0 || index >= this.shapes.length) {
            throw new Error("Invalid shape index")
        }

        this.scene.remove(this.shapes[index].getMesh())
        this.shapes.splice(index, 1)
        return this
    }

    public shapeCount() {
        return this.shapes.length
    }
}
