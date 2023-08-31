import * as trpcExpress from "@trpc/server/adapters/express"
import cors from "cors"
import express from "express"
import { appRouter } from "./trpc-router"

const app = express()

const clientURL = process.env.CLIENT_URL

if (!clientURL) {
    throw new Error("Missing CLIENT_URL env var")
}

app.use(
    cors({
        credentials: true,
        origin: clientURL,
    }),
)
app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext: ({ req, res }) => ({ req, res }),
    }),
)

const port = process.env.SERVER_PORT

if (!port) {
    throw new Error("Missing SERVER_PORT env var")
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
