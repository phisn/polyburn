import { create, StateCreator } from "zustand"
import { createJSONStorage, persist, StateStorage } from "zustand/middleware"
import { db } from "./db"
import { AuthSlice, authSlice } from "./slices/slice-auth"
import { pendingReplaysSlice, PendingReplaysSlice } from "./slices/slice-pending-replays"
import { PopupSlice, popupSlice } from "./slices/slice-popup"

export type AppStore = AuthSlice & HydrateSlice & PendingReplaysSlice & PopupSlice

export const useAppStore = create<AppStore>()(
    persist(
        (...args) => ({
            ...authSlice(...args),
            ...hydrateSlice(...args),
            ...pendingReplaysSlice(...args),
            ...popupSlice(...args),
        }),
        {
            name: "rocket-game",
            version: 2,
            storage: createJSONStorage(() => storage),

            partialize: state => ({
                jwt: state.currentUserJwt,
                pendingReplays: state.pendingReplays,
            }),
            onRehydrateStorage: () => async (state, error) => {
                if (!state) {
                    console.error("Failed to rehydrate storage", error)
                    return
                }

                if (state.currentUserJwt) {
                    try {
                        /*
                        const me = await trpcNative.user.me.query()
                        state.setCurrentUser(me)

                        console.log("Hydrated user", me)
                        */
                    } catch (e) {
                        state.logout()
                        console.error("Failed to retrieve user", e)

                        state.newAlert({
                            type: "warning",
                            message: "Failed to retrieve stored user. Please login again.",
                        })
                    }
                }

                state.setHydrated()
            },
        },
    ),
)

interface HydrateSlice {
    hydrated: boolean
    setHydrated(): void
}

const hydrateSlice: StateCreator<HydrateSlice> = set => ({
    hydrated: false,
    setHydrated: () => {
        set({ hydrated: true })
    },
})

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
