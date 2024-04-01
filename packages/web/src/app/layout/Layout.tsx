import { GoogleOAuthProvider } from "@react-oauth/google"
import { Outlet } from "react-router-dom"
import { useAppStore } from "../../common/storage/app-store"
import { Alert } from "./Alert"
import { AuthButton } from "./AuthButton"

export function Layout() {
    const existsModal = useAppStore(state => state.modalCount > 0)

    console.log("clientid: ", import.meta.env.VITE_AUTH_GOOGLE_CLIENT_ID)

    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_AUTH_GOOGLE_CLIENT_ID}>
            <div
                className={`bg-base-300 flex min-h-screen flex-col ${
                    existsModal && "h-screen overflow-hidden"
                }`}
            >
                <div className="flex w-full justify-end pr-4 pt-4">
                    <AuthButton />
                </div>
                <Outlet />
                <LayoutAlerts />
            </div>
        </GoogleOAuthProvider>
    )
}

function LayoutAlerts() {
    const alerts = useAppStore(state => state.alerts)

    return (
        <div className="toast z-50">
            {alerts.map((alertProps, i) => (
                <Alert key={i} {...alertProps} />
            ))}
        </div>
    )
}
