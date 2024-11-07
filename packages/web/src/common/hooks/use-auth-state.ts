import { useSyncExternalStore } from "react"
import { authService } from "../services/auth-service"

export function useAuthState() {
    return useSyncExternalStore(
        x => authService.subscribeAuthState(x),
        () => authService.getState(),
    )
}
