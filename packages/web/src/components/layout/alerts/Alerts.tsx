import { useGlobalStore } from "../../../common/store"
import { Alert } from "./Alert"

export function Alerts() {
    const alerts = useGlobalStore(state => state.alerts)

    return (
        <div className="toast z-50">
            {alerts.map((alertProps, i) => (
                <Alert key={i} {...alertProps} />
            ))}
        </div>
    )
}
