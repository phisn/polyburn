import { CurrentUserDTO } from "shared/src/worker-api/user"
import { StateCreator } from "zustand"
import { AppStore } from "../app-store"

export interface AuthSlice {
    currentUser?: CurrentUserDTO
    currentUserJwt?: string

    logout(): void
    setCurrentUser(user: CurrentUserDTO): void
    setCurrentUserJwt(jwt: string): void
}

export const authSlice: StateCreator<AppStore, [], [], AuthSlice> = (set, get) => ({
    currentUserJwt: undefined,
    currentUser: undefined,

    logout: () => {
        set({ currentUserJwt: undefined, currentUser: undefined })
    },
    setCurrentUser: user => {
        if (user) {
            get().uploadPendingReplays()
        }

        set({ currentUser: user })
    },
    setCurrentUserJwt: jwt => {
        set({ currentUserJwt: jwt })
    },
})
