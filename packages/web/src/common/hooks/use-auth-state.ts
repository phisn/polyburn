import { useSyncExternalStore } from "react"
import { authService } from "../services/auth-service"

export function useAuthState() {
    useSyncExternalStore(authService.subscribeAuthState, () => authService.getState())
}
