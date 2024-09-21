import * as THREE from "three"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader"

export class Svg extends THREE.Group {
    constructor(svgText: string, opacity?: number) {
        super()

        const svgLoader = new SVGLoader()
        const svg = svgLoader.parse(svgText)

        for (const path of svg.paths) {
            const material = new THREE.MeshBasicMaterial({
                color: path.color,
                opacity: opacity ?? 1,
                transparent: opacity !== undefined,
            })

            const shapes = SVGLoader.createShapes(path)

            for (const shape of shapes) {
                const geometry = new THREE.ShapeGeometry(shape)
                const mesh = new THREE.Mesh(geometry, material)

                this.add(mesh)
            }
        }
    }
}
