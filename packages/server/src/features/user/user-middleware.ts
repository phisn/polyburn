import { decode, verify } from "@tsndr/cloudflare-worker-jwt"
import { MiddlewareHandler } from "hono"
import { Environment } from "../../env"
import { JwtToken } from "./user-model"

export const middlewareAuth: MiddlewareHandler<Environment> = async (c, next) => {
    const authorization = c.req.header("Authorization")

    if (authorization === undefined) {
        c.set("jwtToken", undefined)
        c.set("userId", undefined)
        return next()
    }

    const verified = await verify(authorization, c.env.ENV_JWT_SECRET)

    if (verified === false) {
        return c.body(null, 401)
    }

    const token = decode<JwtToken>(authorization)

    if (token.payload === undefined) {
        return c.body(null, 401)
    }

    const WEEK_IN_MS = 1000 * 60 * 60 * 24 * 7

    if (token.payload.iat < Date.now() - WEEK_IN_MS) {
        return c.body(null, 401)
    }

    if (token.payload.type === "login") {
        c.set("userId", token.payload.userId)
    }

    c.set("jwtToken", token.payload)

    return next()
}
