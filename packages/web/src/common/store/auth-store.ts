import { UserDTO } from "shared/src/server/user"
import { create } from "zustand"

export interface AuthStore {
    currentUser?: UserDTO
    setCurrentUser(user: UserDTO): void
}

export const useAuthStore = create<AuthStore>(set => ({
    currentUser: undefined,
    setCurrentUser: (user: UserDTO) => set({ currentUser: user }),
}))
