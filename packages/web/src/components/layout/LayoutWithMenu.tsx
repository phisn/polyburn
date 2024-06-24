import { isMobile } from "react-device-detect"
import { Layout } from "./Layout"
import { Navbar } from "./navbar/Navbar"

export function LayoutWithMenu() {
    const mobileClass = isMobile ? "" : "space-y-2"

    return (
        <div
            className={`bg-base-300 flex h-screen w-screen touch-none select-none flex-col overflow-clip ${mobileClass}`}
        >
            <Navbar />
            <Layout />
        </div>
    )
}
