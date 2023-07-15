import "./main.css"

import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import React from "react"
import App from "./app/App"

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)
