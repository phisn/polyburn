import { Outlet } from "react-router-dom"
import { Modals } from "../modals/Modals"
import { Alerts } from "./alerts/Alerts"

export function Layout() {
    return (
        <>
            <Outlet />

            <Alerts />
            <Modals />
        </>
    )
}
