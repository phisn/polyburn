import { create } from "zustand"

import { AlertProps } from "../app/layout/Alert"

type Modal = (props: { onClose: () => void }) => React.ReactNode

export interface GlobalStore {
    alerts: AlertProps[]
    modals: Modal[]
    newAlert: (alert: AlertProps) => void
    newModal: (modal: Modal, onClose: () => void) => void
    popModal: () => void
}

const useGlobalStore = create<GlobalStore>(set => ({
    alerts: [],
    modals: [],
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
    newModal: (modal: Modal, onClose: () => void) => {
        set(state => ({
            modals: [...state.modals, modal],
        }))
    },
    popModal: () => {
        // pop front
        set(state => ({
            modals: state.modals.slice(1),
        }))
    },
}))

export default useGlobalStore
