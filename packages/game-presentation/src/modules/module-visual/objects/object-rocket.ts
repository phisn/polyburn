import { ROCKET_SIZE } from "game/src/modules/module-rocket"
import { createNoise3D } from "simplex-noise"
import * as THREE from "three"
import { Svg } from "../svg"

function cyrb128(str: string) {
    let h1 = 1779033703,
        h2 = 3144134277,
        h3 = 1013904242,
        h4 = 2773480762

    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i)
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067)
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233)
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213)
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179)
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067)
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233)
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213)
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179)
    ;(h1 ^= h2 ^ h3 ^ h4), (h2 ^= h1), (h3 ^= h1), (h4 ^= h1)
    return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0] as const
}

function sfc32(a: number, b: number, c: number, d: number) {
    return function () {
        a |= 0
        b |= 0
        c |= 0
        d |= 0

        const t = (((a + b) | 0) + d) | 0

        d = (d + 1) | 0
        a = b ^ (b >>> 9)
        b = (c + (c << 3)) | 0
        c = (c << 21) | (c >>> 11)
        c = (c + t) | 0

        return (t >>> 0) / 4294967296
    }
}

export class Rocket extends THREE.Object3D {
    // private texture: THREE.DataTexture

    constructor(opacity?: number) {
        super()

        const svgObject = new Svg(
            '<?xml version="1.0"?> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 600" height="600" width="300"><path fill="#FFF" opacity="1" d=" M 1 502 L 3 355 C 4 344 4 334 5 324 C 7 310 9 297 11 284 C 15 256 23 229 32 202 C 43 169 57 138 74 108 C 87 85 100 62 117 42 L 150 0 L 183 42 C 200 62 213 85 226 108 C 243 138 257 169 268 202 C 277 229 285 256 289 284 C 291 297 293 310 295 324 C 296 334 296 344 297 355 L 299 502 z"/><path fill="#FFF" opacity="1" d="M 300 600 L 190 502 L 299 502"/><path fill="#FFF" opacity="1" d="M 0 600 L 1 502 L 110 502"/></svg>',
            opacity,
        )

        const scale = (0.15 * 1) / 25.0
        const rocketEntry = ROCKET_SIZE

        /*

        const svgLoader = new SVGLoader()
        const svg = svgLoader.parse(
         

        /*
        const sh: THREE.Shape[] = []

        for (const path of svg.paths) {
            sh.push(...SVGLoader.createShapes(path))
        }

        this.texture = new THREE.DataTexture()
        this.texture.needsUpdate = true

        // Adjust texture scaling and repeat
        this.texture.wrapS = THREE.RepeatWrapping
        this.texture.wrapT = THREE.RepeatWrapping

        // Adjust these values to control the texture scale
        // Lower values make the texture appear larger on the object
        this.texture.repeat.set(0.0015, 0.0015)
        //  texture.offset.set(0.25, 0.25)

        const mesh = new THREE.Mesh(
            new THREE.ShapeGeometry(sh),
            new THREE.MeshBasicMaterial({ map: this.texture }),
        )

        const innerScale = 0.7

        mesh.scale.set(scale * innerScale, scale * innerScale, 20.0)
        mesh.rotation.set(0, 0, Math.PI)
        mesh.position.set(
            (innerScale * rocketEntry.width) / 2,
            (innerScale * rocketEntry.height) / 2,
            1.0,
        )

        this.add(mesh)
        */
        svgObject.scale.set(scale, scale, 1.0)
        svgObject.rotation.set(0, 0, Math.PI)
        svgObject.position.set(rocketEntry.width / 2, rocketEntry.height / 2, 0.9)

        this.add(svgObject)

        /*
        const scale = (0.15 * 1) / 25.0
        const rocketEntry = ROCKET_SIZE

        svg.scale.set(scale, scale, 1.0)
        svg.rotation.set(0, 0, Math.PI)
        svg.position.set(rocketEntry.width / 2, rocketEntry.height / 2, 1.0)

        this.add(svg)
        */
    }

    private acc = 0
    private noise = createNoise3D(sfc32(...cyrb128("")))

    onUpdate(_delta: number) {
        /*
        this.acc += delta

        const now = Date.now()
        const width = 96
        const height = 96
        const size = width * height
        const data = new Uint8Array(4 * size) // RGBA format: 4 values per pixel

        // Fill the texture data pixel by pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4

                const noisera =
                    0.5 * this.noise(x * 0.01 + 96 * 10, y * 0.01, this.acc * 0.00025) + 0 // 0.5 * this.noise(x * 0.01 + 96 * 10, y * 0.01, this.acc * 0.0005)

                const noiserb =
                    0.5 * this.noise(x * 0.01 + 96 * 20, y * 0.01, this.acc * 0.00025) + 0 // 0.5 * this.noise(x * 0.01 + 96 * 20, y * 0.01, this.acc * 0.0005)

                const noiserc = 0.5 * this.noise(x * 0.01, y * 0.01, this.acc * 0.00025) + 0 // 0.5 * this.noise(x * 0.01, y * 0.01, this.acc * 0.0005)

                // Interpolate between red and blue
                data[index] = noisera * 100
                data[index + 1] = noiserb * 20
                data[index + 2] = noiserc * 100
                data[index + 3] = 255 // A
            }
        }

        this.texture.image = {
            data: new Uint8ClampedArray(data),
            height,
            width,
        }

        this.texture.needsUpdate = true
        */
    }
}
