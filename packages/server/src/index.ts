import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { Env } from "./env"
import { createContext } from "./framework/trpc"
import { appRouter } from "./framework/trpc-router"

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
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
    },
}

// initialize rapier wasm special for cloudflare workers
import * as imports from "@dimforge/rapier2d/rapier_wasm2d_bg"
import _wasm from "../../../node_modules/@dimforge/rapier2d/rapier_wasm2d_bg.wasm"

imports.__setWasm(new WebAssembly.Instance(_wasm, { "./rapier_wasm2d_bg.js": imports }).exports)
