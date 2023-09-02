import * as trpcExpress from "@trpc/server/adapters/express"
import cors from "cors"
import express from "express"
import { z } from "zod"
import { appRouter } from "./trpc-router"

const app = express()

const env = z
    .object({
        SERVER_PORT: z
            .string({
                required_error: "SERVER_PORT is required",
            })
            .regex(/\d+/, "SERVER_PORT must be a number"),
        CLIENT_URL: z
            .string({
                required_error: "CLIENT_URL is required",
            })
            .url("CLIENT_URL must be a valid URL"),
    })
    .parse(process.env)

// app.use(morgan("dev"))

app.use(
    cors({
        credentials: true,
        origin: env.CLIENT_URL,
    }),
)

app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext: ({ req, res }) => ({ req, res }),
    }),
)

app.listen(env.SERVER_PORT, () => {
    console.log(`Server running on port ${env.SERVER_PORT}`)
})
