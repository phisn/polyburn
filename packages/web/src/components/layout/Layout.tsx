import { Outlet } from "react-router-dom"
import { useAppStore } from "../../common/store/app-store"
import { Alerts } from "./alerts/Alerts"

export function Layout() {
    const existsModal = useAppStore(state => state.modalCount > 0)

    return (
        <>
            <Outlet />
            <Alerts />
        </>
    )
}
