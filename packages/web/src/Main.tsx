import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { registerSW } from "virtual:pwa-register"
import "./main.css"
import { App } from "./pages/App"

// TODO: think about implementing periodic updates
// https://vite-pwa-org.netlify.app/guide/periodic-sw-updates.html
registerSW({ immediate: true })

const root = document.getElementById("root")

if (!root) {
    throw new Error("No root element found")
}

createRoot(root).render(
    //    <StrictMode>
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    //    </StrictMode>,
)
