import { nanoid } from "nanoid"
import { create } from "zustand"
import { StateStorage, createJSONStorage, persist } from "zustand/middleware"
import { nameFromString } from "../../../../shared/src/Names"
import { AlertProps } from "../../app/layout/Alert"
import { db } from "./db"

export interface AppStore {
    token: string

    userId(): string
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

import jsSHA from "jssha"

export const useAppStore = create<AppStore>()(
    persist(
        (set, get) => ({
            token: nanoid(),
            userId: () => new jsSHA("SHA-512", "TEXT").update(get().token ?? "").getHash("B64"),
            userName: () => nameFromString(get().userId()),

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
                token: state.token,
            }),
            onRehydrateStorage: () => state => {
                console.log(
                    "User Id: " + state?.userId(),
                    ", User Name: " + nameFromString(state?.userId() ?? ""),
                )
            },
        },
    ),
)
