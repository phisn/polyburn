import { hc } from "hono/client"
import type { AppType } from "server/src/index"
import { authService } from "./auth-service"

export const rpc = hc<AppType>(import.meta.env.VITE_URL_SERVER, {
    fetch: async (input: any, init: any) => {
        const response = await fetch(input, {
            ...init,
            credentials: "include",
        })

        if (response.status === 401) {
            authService.logout()
        }

        return response
    },
    headers: () => {
        const jwt = authService.getJwt()

        if (jwt === undefined) {
            return {} as Record<string, string>
        }

        return {
            Authorization: jwt,
        }
    },
})
