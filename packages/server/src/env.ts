import { DrizzleD1Database } from "drizzle-orm/d1"
import { JwtToken } from "./features/user/user-model"

export type Bindings = {
    DB: D1Database

    ENV_GOOGLE_ID: string
    ENV_GOOGLE_SECRET: string
    ENV_JWT_SECRET: string
    ENV_URL_API: string
    ENV_URL_CLIENT: string
}

export type Variables = {
    db: DrizzleD1Database
    jwtToken?: JwtToken
    userId?: number
}

export type Environment = {
    Bindings: Bindings
    Variables: Variables
}
