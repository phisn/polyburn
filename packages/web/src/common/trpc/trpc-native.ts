import { createTRPCProxyClient, httpBatchLink } from "@trpc/client"
import superjson from "superjson"
import { AppRouter } from "../../../../server/src/framework/trpc-router"
import { useAppStore } from "../storage/app-store"

export const options = {
    links: [
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
                const jwt = useAppStore.getState().jwt

                if (jwt) {
                    return {
                        authorization: jwt,
                    }
                }

                return {}
            },
        }),
    ],
    transformer: superjson,
}

export const trpcNative = createTRPCProxyClient<AppRouter>(options)
