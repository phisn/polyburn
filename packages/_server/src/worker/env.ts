import { DurableObjectLobby } from "../do-lobby/do-lobby"

export interface Env {
    CLIENT_URL: string
    API_URL: string

    DB: D1Database
    LOBBY_DO: DurableObjectNamespace<DurableObjectLobby>

    AUTH_DISCORD_CLIENT_ID: string
    AUTH_DISCORD_CLIENT_SECRET: string

    AUTH_GOOGLE_CLIENT_ID: string
    AUTH_GOOGLE_CLIENT_SECRET: string

    JWT_SECRET: string
}
