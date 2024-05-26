import jwt from "@tsndr/cloudflare-worker-jwt"
import { JwtToken } from "../../domain/auth/jwt-token"
import { User } from "../../domain/auth/user"
import { Env } from "../../env"

export function userFromAuthorizationHeader(env: Env, authorization: string | null): User | null {
    try {
        if (authorization && authorization !== "undefined") {
            console.log("Authorization", authorization)

            if (!jwt.verify(authorization, env.JWT_SECRET)) {
                return null
            }

            const payload = jwt.decode<JwtToken>(authorization).payload

            if (!payload) {
                return null
            }

            return { id: payload.id }
        }
    } catch (e) {
        console.error(e)
    }

    return null
}
