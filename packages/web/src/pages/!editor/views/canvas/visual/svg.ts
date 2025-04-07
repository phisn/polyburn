import * as THREE from "three"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader"

export class Svg extends THREE.Group {
    private paths: {
        color: THREE.Color
        material: THREE.MeshBasicMaterial
    }[]

    private colorSet: boolean

    constructor(svgText: string, opacity?: number) {
        super()

        const svgLoader = new SVGLoader()
        const svg = svgLoader.parse(svgText)

        this.paths = []

        for (const path of svg.paths) {
            const material = new THREE.MeshBasicMaterial({
                color: path.color,
                opacity: opacity ?? 1,
                transparent: opacity !== undefined,
            })

            this.paths.push({
                color: path.color.clone(),
                material,
            })

            const shapes = SVGLoader.createShapes(path)

            for (const shape of shapes) {
                const geometry = new THREE.ShapeGeometry(shape)
                const mesh = new THREE.Mesh(geometry, material)

                this.add(mesh)
            }
        }

        this.colorSet = false
    }

    setColor(color?: string) {
        if (color) {
            this.colorSet = true
        } else {
            if (this.colorSet === false) {
                console.log("skip")
                return
            }

            this.colorSet = false
        }

        for (const path of this.paths) {
            if (color) {
                path.material.color.set(color)
            } else {
                path.material.color.set(path.color)
            }
        }
    }

    isColorSet() {
        return this.colorSet
    }
}
