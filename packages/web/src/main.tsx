import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { registerSW } from "virtual:pwa-register"
import { App } from "./app/App"
import "./main.css"

// TODO: think about implementing periodic updates
// https://vite-pwa-org.netlify.app/guide/periodic-sw-updates.html
registerSW({ immediate: true })

const root = document.getElementById("root")

if (!root) {
    throw new Error("No root element found")
}

const RAPIER = await import("@dimforge/rapier2d")
const world = new RAPIER.World(new RAPIER.Vector2(3, 2))
console.log(world.gravity.x * world.gravity.y)

createRoot(root).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>,
)
