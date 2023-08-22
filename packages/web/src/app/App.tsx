import { Navigate, Route, Routes } from "react-router-dom"
import { NotFound } from "./NotFound"
import { Campaign } from "./campaign/Campaign"
import { Editor } from "./editor/Editor"
import { Layout } from "./layout/Layout"

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route path="/" element={<Navigate to="/campaign" replace />} />
                <Route path="/campaign" element={<Campaign />} />
                <Route path="/editor" element={<Editor />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    )
}

export default App
