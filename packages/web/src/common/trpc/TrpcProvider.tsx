import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { trpc } from "./trpc"
import { options } from "./trpc-native"

console.log(`Calling api at "${import.meta.env.VITE_SERVER_URL}/trpc/"`)

const client = trpc.createClient(options)
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
