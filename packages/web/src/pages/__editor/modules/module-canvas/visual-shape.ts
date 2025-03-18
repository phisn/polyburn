import { Color, Mesh, MeshBasicMaterial, Object3D, Vector2 } from "three"
import { subscribe } from "valtio"
import { EntityBundleShape } from "../../store/model"
import { EditorStore } from "../../store/store"
import { MutatableShapeGeometry } from "./MutatableShapeGeometry"

export class VisualShape extends Object3D {
    private shapeGeometry: MutatableShapeGeometry
    private color: Color
    private colorModified: boolean

    constructor(store: EditorStore, bundle: EntityBundleShape) {
        super()

        const focus = store.resources.get("focus")
        const shape = bundle.shape.get("shape")
        const transform = bundle.shape.get("transform")

        this.shapeGeometry = new MutatableShapeGeometry(
            shape.vertices.map(vertex => ({
                position: new Vector2(vertex.point.x, vertex.point.y),
                color: vertex.color,
            })),
        )

        const shapeMaterial = new MeshBasicMaterial({ vertexColors: true })
        shapeMaterial.depthTest = false
        this.color = shapeMaterial.color.clone()
        this.colorModified = false

        const shapeMesh = new Mesh(this.shapeGeometry, shapeMaterial)
        this.add(shapeMesh)

        subscribe(shape, () => {
            this.shapeGeometry.update(
                shape.vertices.map(vertex => ({
                    position: new Vector2(vertex.point.x, vertex.point.y),
                    color: vertex.color,
                })),
            )
        })

        const callbackTransform = () => {
            shapeMesh.position.set(transform.point.x, transform.point.y, 0)
            shapeMesh.rotation.set(0, 0, transform.rotation)

            console.log(transform.point, transform.rotation)
        }

        subscribe(transform, callbackTransform)
        callbackTransform()

        const callbackFocus = () => {
            if (focus.bundlesHighlighted.has(bundle.id)) {
                shapeMaterial.color.set("#ffdd66")
                this.colorModified = true
            } else if (focus.bundlesSelected.has(bundle.id)) {
                shapeMaterial.color.set("#ffbb00")
                this.colorModified = true
            } else if (this.colorModified) {
                shapeMaterial.color.set(this.color)
                this.colorModified = false
            }
        }

        subscribe(focus, callbackFocus)
    }
}
