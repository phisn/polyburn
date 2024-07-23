import { StateCreator } from "zustand"
import { UserMe } from "../../../../shared/src/worker-api/user-me"
import { trpcNative } from "../trpc/trpc-native"
import { PopupSlice } from "./slice-popup"

export interface AuthSlice {
    jwt: string | undefined
    user: UserMe | undefined

    updateJwt: (jwt?: string) => void
    updateUser: (user?: UserMe) => void

    logout: () => void
}

export const authSlice: StateCreator<AuthSlice> = set => ({
    jwt: undefined,
    user: undefined,

    updateJwt: jwt => {
        set({ jwt })
    },

    updateUser: user => {
        set({ user })
    },

    logout: () => {
        set({ jwt: undefined, user: undefined })
    },
})

export async function authHydrateStorageSideEffect(state: AuthSlice & PopupSlice) {
    if (state.jwt) {
        try {
            const me = await trpcNative.user.me.query()
            state.updateUser(me)
        } catch (e) {
            state.updateJwt(undefined)
            console.error("Failed to retrieve user", e)

            state.newAlert({
                type: "warning",
                message: "Failed to retrieve user. Login again.",
            })
        }
    }
}
