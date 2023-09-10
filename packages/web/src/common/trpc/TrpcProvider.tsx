import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import superjson from "superjson"
import { trpc } from "./trpc"

console.log(`Calling api at "${import.meta.env.VITE_SERVER_URL}/trpc/"`)

const client = trpc.createClient({
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
})

const queryClient = new QueryClient()

export function TrpcProvider(props: { children: React.ReactNode }) {
    return (
        <trpc.Provider client={client} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                <>{props.children}</>
            </QueryClientProvider>
        </trpc.Provider>
    )
}
