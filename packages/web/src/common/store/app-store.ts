import { create } from "zustand"
import { StateStorage, createJSONStorage, persist } from "zustand/middleware"
import { db } from "./db"
import { AuthSlice, authHydrateStorageSideEffect, authSlice } from "./slice-auth"
import { PopupSlice, popupSlice } from "./slice-popup"

export interface AppStore extends AuthSlice, PopupSlice {
    hydrated: boolean
    setHydrated: () => void
    hasHydrated: () => boolean
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
        (set, get, ...a) => ({
            hydrated: false,
            setHydrated: () => {
                set({ hydrated: true })
            },
            hasHydrated: () => {
                return get().hydrated
            },
            ...authSlice(set, get, ...a),
            ...popupSlice(set, get, ...a),
        }),
        {
            name: "rocket-game",
            version: 2,
            storage: createJSONStorage(() => storage),

            partialize: state => ({
                jwt: state.jwt,
            }),
            onRehydrateStorage: () => async state => {
                if (!state) {
                    return
                }

                await authHydrateStorageSideEffect(state)

                state.setHydrated()
            },
        },
    ),
)
