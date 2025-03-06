import { GoogleOAuthProvider } from "@react-oauth/google"
import { Navigate, Route, Routes } from "react-router-dom"
import { Layout } from "../components/layout/Layout"
import { LayoutWithMenu } from "../components/layout/LayoutWithMenu"
import { NotFound } from "./NotFound"
import { Campaign } from "./campaign/Campaign"
import { Editor } from "./editor/Editor"
import { Player } from "./player/Player"
import { Replayer } from "./replayer/Replayer"
import { Slot } from "./slot/Slot"

export function App() {
    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_AUTH_GOOGLE_CLIENT_ID}>
            <Routes>
                <Route path="/" element={<LayoutWithMenu />}>
                    <Route path="/" element={<Navigate to="/campaign" replace />} />
                    <Route path="/campaign" element={<Campaign />} />
                    <Route path="/editor" element={<Editor />} />
                </Route>
                <Route path="/" element={<Layout />}>
                    <Route path="/" element={<Navigate to="/campaign" replace />} />
                    <Route path="/play/:worldname/:gamemode" element={<Player />} />
                    <Route path="/replay/:replayId" element={<Replayer />} />
                    <Route path="/slot" element={<Slot />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </GoogleOAuthProvider>
    )
}
