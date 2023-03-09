import "./main.css"

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router-dom"

import App from "./App"
import Editor from "./editor/Editor"

const container = document.getElementById("root")
const root = createRoot(container as HTMLElement)

root.render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />}>
                    <Route path="editor" element={<Editor />} />
                    {/*        <Route path="editor" element={<Editor />} />
            <Route path="test" element={<EditorEditor />} />*/}
                    <Route path="*" element={
                        <div>
                404
                        </div>
                    } />
                </Route>
            </Routes>
        </BrowserRouter>
    </StrictMode>
)
