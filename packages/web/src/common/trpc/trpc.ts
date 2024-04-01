import { createTRPCReact } from "@trpc/react-query"
import { AppRouter } from "../../../../server/src/framework/trpc-router"

export const trpc = createTRPCReact<AppRouter>()
