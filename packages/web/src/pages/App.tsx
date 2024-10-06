import { GoogleOAuthProvider } from "@react-oauth/google"
import { Navigate, Route, Routes } from "react-router-dom"
import { TrpcProvider } from "../common/trpc/TrpcProvider"
import { Layout } from "../components/layout/Layout"
import { LayoutWithMenu } from "../components/layout/LayoutWithMenu"
import { NotFound } from "./NotFound"
import { Campaign } from "./campaign/Campaign"
import { Editor } from "./editor/Editor"
import { Play } from "./player/Play"
import { Slot } from "./slot/Slot"

export function App() {
    return (
        <TrpcProvider>
            <GoogleOAuthProvider clientId={import.meta.env.VITE_AUTH_GOOGLE_CLIENT_ID}>
                <Routes>
                    <Route path="/" element={<LayoutWithMenu />}>
                        <Route path="/" element={<Navigate to="/campaign" replace />} />
                        <Route path="/campaign" element={<Campaign />} />
                        <Route path="/editor" element={<Editor />} />
                    </Route>
                    <Route path="/" element={<Layout />}>
                        <Route path="/" element={<Navigate to="/campaign" replace />} />
                        <Route path="/play/:world/:gamemode" element={<Play />} />
                        <Route path="/slot" element={<Slot />} />
                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
            </GoogleOAuthProvider>
        </TrpcProvider>
    )
}
