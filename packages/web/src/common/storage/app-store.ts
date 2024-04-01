import { create } from "zustand"
import { StateStorage, createJSONStorage, persist } from "zustand/middleware"
import { AlertProps } from "../../app/layout/Alert"
import { db } from "./db"

export interface AppStore {
    jwt: string | undefined
    user: { username: string } | undefined

    updateJwt: (jwt: string) => void
    updateUser: (user: { username: string }) => void

    alerts: AlertProps[]
    modalCount: number
    newAlert: (alert: AlertProps) => void
}

const storage: StateStorage = {
    getItem: async key => {
        const value = await db.zustand.get(key)
        return value?.value ?? null
    },
    setItem: async (key, value) => {
        await db.zustand.put({ key, value })
    },
    removeItem: async key => {
        await db.zustand.delete(key)
    },
}

export const useAppStore = create<AppStore>()(
    persist(
        set => ({
            jwt: undefined,
            user: undefined,

            updateJwt: jwt => {
                set({ jwt })
            },

            updateUser: user => {
                set({ user })
            },

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
        }),
        {
            name: "rocket-game",
            version: 2,
            storage: createJSONStorage(() => storage),

            partialize: state => ({
                jwt: state.jwt ?? undefined,
            }),
            onRehydrateStorage: () => () => {},
        },
    ),
)
