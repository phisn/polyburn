import { decode, verify } from "@tsndr/cloudflare-worker-jwt"
import { MiddlewareHandler } from "hono"
import { HTTPException } from "hono/http-exception"
import { Environment } from "../../env"
import { jwtToken } from "./user-model"

export const middlewareAuth: MiddlewareHandler<Environment> = async (c, next) => {
    const authorization = c.req.header("Authorization")

    if (authorization === undefined) {
        c.set("jwtToken", undefined)
        c.set("userId", undefined)
        return next()
    }

    const verified = await verify(authorization, c.env.ENV_JWT_SECRET)

    if (verified === false) {
        throw new HTTPException(401)
    }

    const token = jwtToken.safeParse(decode(authorization).payload)

    if (token.success === false) {
        throw new HTTPException(401)
    }

    const WEEK_IN_MS = 1000 * 60 * 60 * 24 * 7

    if (token.data.iat < Date.now() - WEEK_IN_MS) {
        throw new HTTPException(401)
    }

    c.set("userId", token.data.userId)
    c.set("jwtToken", token.data)

    return next()
}
