import { createTRPCReact } from "@trpc/react-query"
import { AppRouter } from "../../../../server/src/worker/framework/trpc-router"

export const trpc = createTRPCReact<AppRouter>()
