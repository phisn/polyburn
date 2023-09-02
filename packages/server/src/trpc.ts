import { inferAsyncReturnType, initTRPC } from "@trpc/server"
import * as trpcExpress from "@trpc/server/adapters/express"

export const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => ({
    req,
    res,
})

type Context = inferAsyncReturnType<typeof createContext>
const t = initTRPC.context<Context>().create()

export const middleware = t.middleware
export const router = t.router

export const logger = middleware(async opts => {
    try {
        // format date as HH:MM:SS
        console.log(`Req ${new Date().toISOString()}: ${opts.path}`)
        return opts.next()
    } catch (e) {
        console.error(e)
        throw e
    }
})

export const publicProcedure = t.procedure.use(logger)
