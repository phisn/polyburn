import { swaggerUI } from "@hono/swagger-ui"
import { drizzle } from "drizzle-orm/d1"
import { Hono } from "hono"
import { compress } from "hono/compress"
import { cors } from "hono/cors"
import { timing } from "hono/timing"
import { Environment } from "./env"
import { routeUser } from "./features/user/user"
import { middlewareAuth } from "./features/user/user-middleware"
import { routeWorld } from "./features/world/world"

const app = new Hono<Environment>()
    .use(timing())
    .use((c, next) => {
        const corsMiddleware = cors({
            origin: c.env.ENV_JWT_SECRET,
        })

        return corsMiddleware(c, next)
    })
    .use(compress())
    .use((c, next) => {
        c.set("db", drizzle(c.env.DB))
        return next()
    })
    .use(middlewareAuth)
    .use(swaggerUI({ url: "/docs" }))
    .route("/user", routeUser)
    .route("/world", routeWorld)

export type AppType = typeof app
export default app
