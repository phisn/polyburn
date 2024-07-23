import { StateCreator } from "zustand"
import { AlertProps } from "../../components/layout/alerts/alert-props"
import { ModalProps } from "../../components/modals/modal-props"

export interface PopupSlice {
    alerts: AlertProps[]
    newAlert: (alert: AlertProps, time?: number) => void

    modals: ModalProps[]
    newModal: (modal: ModalProps) => void
    removeModal: () => void
}

export const popupSlice: StateCreator<PopupSlice> = set => ({
    alerts: [],
    newAlert: (alert: AlertProps, time?: number) => {
        setTimeout(() => {
            set(state => ({
                alerts: state.alerts.filter(a => a !== alert),
            }))
        }, time || 3000)

        set(state => ({
            alerts: [...state.alerts, alert],
        }))
    },

    modals: [],
    newModal: modal => {
        set(state => ({
            modals: [...state.modals, modal],
        }))
    },
    removeModal: () => {
        set(state => ({
            modals: state.modals.slice(0, state.modals.length - 1),
        }))
    },
})
