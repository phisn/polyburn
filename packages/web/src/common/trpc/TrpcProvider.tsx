import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import { trpc } from "./trpc"

const url = import.meta.env.PROD
    ? `${new URL(document.URL).origin}`
    : `${import.meta.env.VITE_SERVER_URL}`

console.log(`Calling api at "${url}/trpc/"`)

const client = trpc.createClient({
    links: [
        httpBatchLink({
            url: `${url}/trpc`,
            // Needed to support session cookies
            fetch(url, options) {
                return fetch(url, {
                    ...options,
                    credentials: "include",
                })
            },
        }),
    ],
})

const queryClient = new QueryClient()

export function TrpcProvider(props: { children: React.ReactNode }) {
    return (
        <trpc.Provider client={client} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
        </trpc.Provider>
    )
}
