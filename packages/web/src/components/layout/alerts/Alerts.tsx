import { useAppStore } from "../../../common/store/app-store"
import { Alert } from "./Alert"

export function Alerts() {
    const alerts = useAppStore(state => state.alerts)

    return (
        <div className="toast z-50">
            {alerts.map((alertProps, i) => (
                <Alert key={i} {...alertProps} />
            ))}
        </div>
    )
}
