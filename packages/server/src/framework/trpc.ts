import { inferAsyncReturnType, initTRPC } from "@trpc/server"
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import { drizzle } from "drizzle-orm/d1"
import { OAuth2Client } from "oslo/oauth2"
import superjson from "superjson"
import { Env } from "../env"
import { userFromAuthorizationHeader } from "./helper/user-from-authorization-header"

export const createContext =
    (env: Env) =>
    ({ req }: FetchCreateContextFnOptions) => {
        const user = userFromAuthorizationHeader(env, req.headers.get("Authorization"))

        return {
            db: drizzle(env.DB),
            oauth: new OAuth2Client(
                env.AUTH_GOOGLE_CLIENT_ID,
                "https://accounts.google.com/o/oauth2/auth",
                "https://accounts.google.com/o/oauth2/token",
                {
                    redirectURI: env.CLIENT_URL,
                },
            ),
            env,
            user,
        }
    }

type Context = inferAsyncReturnType<inferAsyncReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create({
    transformer: superjson,
})

export const middleware = t.middleware
export const router = t.router

export const logger = middleware(async opts => {
    try {
        // format date as HH:MM:SS
        console.log(`Req ${new Date().toISOString()}: ${opts.path}`)
        return await opts.next()
    } catch (e) {
        console.error(e)
        throw e
    }
})

export const publicProcedure = t.procedure.use(logger)
