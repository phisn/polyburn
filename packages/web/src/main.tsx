import "./main.css"

import React from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { registerSW } from "virtual:pwa-register"
import App from "./app/App"

// TODO: think about implementing periodic updates
// https://vite-pwa-org.netlify.app/guide/periodic-sw-updates.html
registerSW({ immediate: true })

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)

/*
const raw =
    "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"

const world = importWorld(raw)

let i = 0
let k = 0

const wm = WorldModel.create({
    gamemodes: { normal: { groups: ["normal"] } },
    groups: {
        normal: {
            rockets: [
                ...world.entities
                    .filter((e): e is RocketEntityModel => e.type === EntityType.Rocket)
                    .map(e => {
                        const r: RocketModel = {
                            rotation: e.rotation,

                            positionX: e.position.x,
                            positionY: e.position.y,

                            defaultConfig: undefined,
                        }

                        i += 12

                        console.log("Got rocket posx: " + e.position.x)

                        return r
                    }),
            ],
            shapes: [
                ...world.shapes.map(e => {
                    const r: ShapeModel = {
                        vertices: verticesToBytes(
                            e.vertices.map(v => ({
                                point: {
                                    x: v.x,
                                    y: v.y,
                                },
                                color: 0xdc5249,
                            })),
                        ),
                    }

                    const vertices = bytesToVertices(r.vertices)

                    let maxdx = 0
                    let maxdy = 0

                    vertices.forEach((v, i) => {
                        if (v.point.x - e.vertices[i].x > maxdx) {
                            maxdx = v.point.x - e.vertices[i].x
                        }

                        if (v.point.y - e.vertices[i].y > maxdy) {
                            maxdy = v.point.y - e.vertices[i].y
                        }

                        console.log(
                            `dx: ${v.point.x - e.vertices[i].x}, dy: ${
                                v.point.y - e.vertices[i].y
                            }`,
                        )
                    })

                    console.log("maxdx: " + maxdx + ", maxdy: " + maxdy)

                    i += 12

                    console.log("Got shape with vertices: " + e.vertices.length)

                    return r
                }),
            ],
            levels: [
                ...world.entities
                    .filter((e): e is FlagEntityModel => e.type === EntityType.Level)
                    .map(e => {
                        const r: LevelModel = {
                            rotation: e.rotation,

                            positionX: e.position.x,
                            positionY: e.position.y,

                            cameraTopLeftX: e.cameraTopLeft.x,
                            cameraTopLeftY: e.cameraTopLeft.y,

                            cameraBottomRightX: e.cameraBottomRight.x,
                            cameraBottomRightY: e.cameraBottomRight.y,

                            captureAreaLeft: e.captureLeft,
                            captureAreaRight: e.captureRight,
                        }

                        i += 9 * 4

                        console.log("Got level posx: " + e.position.x)

                        return r
                    }),
            ],
        },
    },
})

const uncoded = WorldModel.decode(WorldModel.encode(wm).finish())

async function bufferToBase64(buffer: any) {
    // use a FileReader to generate a base64 data URI:
    const base64url = (await new Promise(r => {
        const reader = new FileReader()
        reader.onload = () => r(reader.result)
        reader.readAsDataURL(new Blob([buffer]))
    })) as any
    // remove the `data:...;base64,` part from the start
    return base64url.slice(base64url.indexOf(",") + 1)
}

const u8 = WorldModel.encode(wm).finish()

console.log("length: " + u8.length)

bufferToBase64(u8).then(b64 => {
    console.log("Got b64: " + b64)
    console.log("from " + raw.length + " bytes, to " + b64.length + " bytes")
})
*/

/*
console.log(
    "are equal" +
        (JSON.stringify(wm.groups["normal"].shapes[0].vertices) ===
            JSON.stringify(uncoded.groups["normal"].shapes[0].vertices)),
)

const r1 = wm.groups["normal"].shapes[0].vertices
const r2 = uncoded.groups["normal"].shapes[0].vertices

const v1 = bytesToVertices(wm.groups["normal"].shapes[0].vertices)
const v2 = bytesToVertices(uncoded.groups["normal"].shapes[0].vertices)

let b = false

for (let i = 0; i < r1.length; i++) {
    if (r1[i] !== r2[i]) {
        b = true
        break
    }
}

console.log("is true? " + b)

console.log("are equal" + JSON.stringify(v1))
console.log(
    "different are " +
        v1.map(
            (v, i) =>
                `${i}: ${v2[i].point.x === v.point.y && v2[i].point.y === v.point.y ? "t" : "f"}`,
        ),
)
console.log(JSON.stringify(v2))

console.log("i: " + i + ", k: " + k)

const vertex1 = {
    point: { x: 2, y: 2 },
    color: 0xff0000,
}

const vertex2 = {
    point: { x: -2, y: -2 },
    color: 0x00ff00,
}

console.log(JSON.stringify(bytesToVertices(verticesToBytes([vertex1, vertex2]))))
*/
