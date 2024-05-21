import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { Env } from "./env"
import { createContext } from "./framework/trpc"
import { appRouter } from "./framework/trpc-router"

export async function fetch(request: Request, env: Env): Promise<Response> {
    if (env.CLIENT_URL === undefined) {
        throw new Error("CLIENT_URL is not defined")
    }

    const headers = {
        "Access-Control-Allow-Origin": "",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
    }

    if (env.CLIENT_URL.split(",").includes(request.headers.get("Origin") || "")) {
        headers["Access-Control-Allow-Origin"] = request.headers.get("Origin") || ""
    }

    if (request.method === "OPTIONS") {
        return new Response(null, {
            headers,
        })
    }

    const url = new URL(request.url)

    if (url.pathname.startsWith("/lobby")) {
        try {
            const upgradeHeader = request.headers.get("Upgrade")

            if (upgradeHeader !== "websocket") {
                console.log("Invalid upgrade header")
                return new Response("Invalid upgrade header", {
                    status: 426,
                })
            }

            const id = env.LOBBY_DO.idFromName("lobby")
            const lobby = env.LOBBY_DO.get(id)

            return lobby.fetch(request)
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    const response = await fetchRequestHandler({
        endpoint: "/trpc",
        req: request,
        router: appRouter,
        createContext: createContext(env),
    })

    Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
    })

    return response
}
