export interface Env {
    CLIENT_URL: string
    API_URL: string

    DB: D1Database

    AUTH_DISCORD_CLIENT_ID: string
    AUTH_DISCORD_CLIENT_SECRET: string

    AUTH_GOOGLE_CLIENT_ID: string
    AUTH_GOOGLE_CLIENT_SECRET: string

    JWT_SECRET: string
}
