import { drizzle } from "drizzle-orm/d1"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { timing } from "hono/timing"
import { Environment } from "./env"
import { routeReplay } from "./features/replay/replay"
import { routeUser } from "./features/user/user"
import { middlewareAuth } from "./features/user/user-middleware"
import { routeWorld } from "./features/world/world"

const app = new Hono<Environment>()
    .use(timing())
    .use((c, next) => {
        const origins = c.env.ENV_URL_CLIENT.split(",")
        const origin = c.req.header("Origin")

        if (origin && origins.includes(origin)) {
            const corsMiddleware = cors({
                credentials: true,
                origin,
            })

            return corsMiddleware(c, next)
        } else {
            return next()
        }
    })
    .use((c, next) => {
        c.set("db", drizzle(c.env.DB))
        return next()
    })
    .use(middlewareAuth)
    .route("/replay", routeReplay)
    .route("/user", routeUser)
    .route("/world", routeWorld)

export type AppType = typeof app
export default app
