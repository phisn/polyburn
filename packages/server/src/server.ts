import * as trpcExpress from "@trpc/server/adapters/express"
import express from "express"
import { appRouter } from "./trpc"

const app = express()

app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext: () => ({}),
    }),
)

const port = process.env.PORT || 3001

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})
