import { TRPCClientError, createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client"
import superjson from "superjson"
import { AppRouter } from "../../../../server/src/worker/framework/trpc-router"
import { useAppStore } from "../storage/app-store"
import { authSyncLink } from "./auth-sync-link"

export const options = {
    links: [
        loggerLink(),
        authSyncLink,
        httpBatchLink({
            url: `${import.meta.env.VITE_SERVER_URL}/trpc`,
            // Needed to support session cookies
            fetch(url, options) {
                return fetch(url, {
                    ...options,
                    credentials: "include",
                })
            },
            headers() {
                const appState = useAppStore.getState()
                const headers: any = {}

                if (appState.jwt) {
                    headers["Authorization"] = appState.jwt
                }

                return headers
            },
        }),
    ],
    transformer: superjson,
}

export const trpcNative = createTRPCProxyClient<AppRouter>(options)

export function isTRPCClientError(cause: unknown): cause is TRPCClientError<AppRouter> {
    return cause instanceof TRPCClientError
}
