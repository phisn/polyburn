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
