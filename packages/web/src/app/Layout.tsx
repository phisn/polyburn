import { Outlet } from "react-router-dom"
import { Navbar } from "./Navbar"

export function Layout() {
    return (
        <div className="bg-base-300 flex min-h-screen flex-col">
            <Navbar />
            <Outlet />
        </div>
    )
}
