import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { ReplayModel } from "runtime/proto/replay"
import { ReplayCaptureService } from "runtime/src/model/replay/ReplayCaptureService"
import { registerSW } from "virtual:pwa-register"
import { App } from "./app/App"
import { bytesToBase64 } from "./app/editor/models/exportModel"
import "./main.css"

// TODO: think about implementing periodic updates
// https://vite-pwa-org.netlify.app/guide/periodic-sw-updates.html
registerSW({ immediate: true })

const root = document.getElementById("root")

if (!root) {
    throw new Error("No root element found")
}

createRoot(root).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>,
)

const service = new ReplayCaptureService()

for (let i = 0; i < 100; i++) {
    service.captureFrame({
        rotation: i / 100,
        thrust: false,
    })
}

const t1 = bytesToBase64(ReplayModel.encode(service.replay).finish())
const t2 = bytesToBase64(ReplayModel.encode(service.replay).finish())
const t3 = bytesToBase64(ReplayModel.encode(service.replay).finish())

console.log(t1.length)
console.log(t2.length)
console.log(t3.length)
