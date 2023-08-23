import { Outlet } from "react-router-dom"
import useGlobalStore from "../../common/GlobalStore"
import { Alert } from "./Alert"
import { Navbar } from "./Navbar"

export function Layout() {
    const alerts = useGlobalStore(state => state.alerts)
    const modals = useGlobalStore(state => state.modals)

    const popModal = useGlobalStore(state => state.popModal)

    const Modal = modals[0]

    return (
        <div className="bg-base-300 flex min-h-screen flex-col">
            <Navbar />
            <Outlet />
            <div className="toast z-50">
                {alerts.map((alertProps, i) => (
                    <Alert key={i} {...alertProps} />
                ))}
            </div>
            {Modal && <Modal onClose={popModal} />}
        </div>
    )
}
