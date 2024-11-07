import { UserDTO } from "shared/src/server/user"
import { create } from "zustand"
import { AlertProps } from "../components/layout/alerts/alert-props"
import { ModalProps } from "../components/modals/modal-props"

export interface GlobalStore {
    alerts: AlertProps[]
    newAlert: (alert: AlertProps, time?: number) => void

    modals: ModalProps[]
    newModal: (modal: ModalProps) => void
    removeModal: () => void

    currentUser?: UserDTO
    setCurrentUser(user?: UserDTO): void
}

export const useGlobalStore = create<GlobalStore>(set => ({
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
    currentUser: undefined,
    setCurrentUser: (user?: UserDTO) => set({ currentUser: user }),
}))
