import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { CurrentUserDTO } from "shared/src/server/user"
import { z } from "zod"

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({
        autoIncrement: true,
    }),

    email: text("email").notNull().unique(),
    username: text("username").notNull().unique(),
})

export type User = typeof users.$inferSelect

export const currentUserDTO = (user: User): CurrentUserDTO => ({
    username: user.username,
})

export const jwtToken = z.union([
    z.object({
        iat: z.number(),
        type: z.literal("login"),
        userId: z.number(),
    }),
    z.object({
        iat: z.number(),
        type: z.literal("signup"),
        email: z.string(),
    }),
])

export type JwtToken = z.infer<typeof jwtToken>
