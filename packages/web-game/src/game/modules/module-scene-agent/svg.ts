import * as THREE from "three"
import { SVGLoader } from "./svg-loader.js"

export class Svg extends THREE.Group {
    constructor(svgText: string) {
        super()

        const svgLoader = new SVGLoader(undefined)
        const svg = svgLoader.parse(svgText)

        for (const path of svg.paths) {
            const material = new THREE.MeshBasicMaterial({
                color: path.color,
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
