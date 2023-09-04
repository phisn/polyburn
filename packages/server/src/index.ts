import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { appRouter } from "./trpc-router"

interface Env {
    ASSETS: Fetcher
    CF_PAGES_URL: string
    DEV: string
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const headers = {
            "Access-Control-Allow-Origin": `${env.CF_PAGES_URL}`,
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Credentials": "true",
        }

        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers,
            })
        }

        const response = await fetchRequestHandler({
            endpoint: "/trpc",
            req: request,
            router: appRouter,
            createContext: () => ({}),
        })

        if (response.status === 404 && env.DEV !== "true") {
            return env.ASSETS.fetch(request)
        }

        Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value)
        })

        return response
    },
}

/*
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
*/
