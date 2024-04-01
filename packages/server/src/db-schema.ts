import { blob, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const leaderboard = sqliteTable(
    "leaderboard",
    {
        id: integer("id").primaryKey({
            autoIncrement: true,
        }),

        world: text("world").notNull(),
        gamemode: text("gamemode").notNull(),

        userId: text("userId").notNull(),
        ticks: integer("ticks").notNull(),
        deaths: integer("deaths").notNull(),

        model: blob("model", { mode: "buffer" }).notNull(),
    },
    leaderboard => ({
        gamemodeWorld: index("gamemodeWorld").on(leaderboard.gamemode, leaderboard.world),
        userId: index("userId").on(leaderboard.userId),
    }),
)

export type Leaderboard = typeof leaderboard.$inferSelect
export type InsertLeaderboard = typeof leaderboard.$inferInsert

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({
        autoIncrement: true,
    }),

    email: text("email").notNull(),
    username: text("username").notNull(),
})

export type Users = typeof users.$inferSelect
export type InsertUsers = typeof users.$inferInsert
