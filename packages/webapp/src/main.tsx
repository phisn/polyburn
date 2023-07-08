import "./main.css"

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router-dom"

import App from "./App"
import { Campaign } from "./campaign/Campaign"
import Editor from "./editor/Editor"
import Play from "./play/Play"

const container = document.getElementById("root")
const root = createRoot(container as HTMLElement)

root.render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />}>
                    <Route path="/" element={<Play />} />
                    <Route path="/editor" element={<Editor />} />
                    <Route path="/campaign" element={<Campaign />} />
                    <Route path="*" element={<Editor />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </StrictMode>
)
