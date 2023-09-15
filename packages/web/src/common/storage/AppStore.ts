import { nanoid } from "nanoid"
import { create } from "zustand"
import { StateStorage, createJSONStorage, persist } from "zustand/middleware"
import { nameFromString } from "../../../../shared/src/Names"
import { AlertProps } from "../../app/layout/Alert"
import { db } from "./db"

export interface AppStore {
    userId: string | null
    userName(): string

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
        (set, get) => ({
            userId: nanoid(),
            userName: () => nameFromString(get().userId ?? ""),

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
            storage: createJSONStorage(() => storage),

            partialize: state => ({
                userId: state.userId,
            }),
            onRehydrateStorage: () => state => {
                console.log(
                    "User Id: " + state?.userId,
                    ", User Name: " + nameFromString(state?.userId ?? ""),
                )
            },
        },
    ),
)
