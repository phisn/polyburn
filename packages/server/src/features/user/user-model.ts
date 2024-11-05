import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { UserDTO } from "shared/src/server/user"
import { z } from "zod"

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({
        autoIncrement: true,
    }),

    email: text("email").notNull().unique(),
    username: text("username").notNull().unique(),
})

export type User = typeof users.$inferSelect

export const userDTO = (user: User): UserDTO => ({
    username: user.username,
})

export const jwtToken = z.object({
    type: z.literal("signin"),
    iat: z.number(),
    userId: z.number(),
})

export type JwtToken = z.infer<typeof jwtToken>

export const signupToken = z.object({
    type: z.literal("signup"),
    iat: z.number(),
    email: z.string(),
})

export type SignupToken = z.infer<typeof signupToken>
