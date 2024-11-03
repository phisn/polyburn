import { UserDTO } from "shared/src/server/user"
import { StateCreator } from "zustand"
import { AppStore } from "../app-store"

export interface AuthSlice {
    currentUser?: UserDTO
    currentUserJwt?: string

    logout(): void
    setCurrentUser(user: UserDTO): void
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
