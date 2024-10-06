import { inferAsyncReturnType, initTRPC } from "@trpc/server"
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import * as jwt from "@tsndr/cloudflare-worker-jwt"
import { drizzle } from "drizzle-orm/d1"
import { OAuth2Client } from "oslo/oauth2"
import superjson from "superjson"
import { Env } from "../env"
import { userFromAuthorizationHeader } from "./helper/user-from-authorization-header"

export const createContext =
    async (env: Env) =>
    ({ req }: FetchCreateContextFnOptions) => {
        const user = userFromAuthorizationHeader(env, req.headers.get("Authorization"))

        if (await jwt.verify(req.headers.get("Authorization") ?? "", env.JWT_SECRET)) {
        }

        return {
            db: drizzle(env.DB),
            oauth: new OAuth2Client(
                env.AUTH_GOOGLE_CLIENT_ID,
                "https://accounts.google.com/o/oauth2/auth",
                "https://accounts.google.com/o/oauth2/token",
                {
                    redirectURI: env.CLIENT_URL.split(",").at(-1),
                },
            ),
            env,
            user,
        }
    }

export type Context = inferAsyncReturnType<typeof createContext>

const t = initTRPC.context<Context>().create({
    transformer: superjson,
})

export const middleware = t.middleware
export const router = t.router

export const logger = middleware(async opts => {
    // format date as HH:MM:SS
    console.log(`Req ${new Date().toISOString()}: ${opts.path}`)
    return await opts.next()
})

export const publicProcedure = t.procedure.use(logger)
