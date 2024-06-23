export type AlertType = "warning" | "error" | "info" | "success"

export interface AlertProps {
    message: string
    type: AlertType
}
