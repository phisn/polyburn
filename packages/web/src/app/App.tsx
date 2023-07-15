import { Navigate, Route, Routes } from "react-router-dom"
import useGlobalStore from "../common/GlobalStore"
import { Layout } from "./Layout"
import { NotFound } from "./NotFound"
import Campaign from "./campaign/Campaign"

function App() {
    const alerts = useGlobalStore(state => state.alerts)

    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route path="/" element={<Navigate to="/campaign" replace />} />
                <Route path="/campaign" element={<Campaign />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    )
}

export default App
