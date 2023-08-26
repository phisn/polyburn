import { create } from "zustand"

import { useEffect } from "react"
import { AlertProps } from "../app/layout/Alert"

type Modal = (props: { onClose: () => void }) => React.ReactNode

export interface GlobalStore {
    alerts: AlertProps[]
    modalCount: number
    newAlert: (alert: AlertProps) => void
}

const useGlobalStore = create<GlobalStore>(set => ({
    alerts: [],
    modalCount: 0,
    newAlert: (alert: AlertProps) => {
        setTimeout(() => {
            set(state => ({
                alerts: state.alerts.filter(a => a !== alert),
            }))
        }, 3000)

        set(state => ({
            alerts: [...state.alerts, alert],
        }))
    },
}))

export function useModalView(open: boolean) {
    useEffect(() => {
        if (open) {
            useGlobalStore.setState(state => ({
                modalCount: state.modalCount + 1,
            }))
        }

        return () => {
            useGlobalStore.setState(state => ({
                modalCount: state.modalCount - 1,
            }))
        }
    }, [open])
}

export default useGlobalStore
