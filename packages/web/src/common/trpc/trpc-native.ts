import { createTRPCProxyClient, httpBatchLink } from "@trpc/client"
import superjson from "superjson"
import { AppRouter } from "../../../../server/src/trpc-router"

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
        }),
    ],
    transformer: superjson,
}

export const trpcNative = createTRPCProxyClient<AppRouter>(options)
