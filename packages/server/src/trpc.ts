import { inferAsyncReturnType, initTRPC } from "@trpc/server"
import { drizzle } from "drizzle-orm/d1"

export const createContext = (db: D1Database) => () => ({
    db: drizzle(db),
})

type Context = inferAsyncReturnType<inferAsyncReturnType<typeof createContext>>
const t = initTRPC.context<Context>().create()

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
