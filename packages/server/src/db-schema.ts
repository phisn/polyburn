import { blob, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

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
        gamemodeWorld: uniqueIndex("gamemodeWorld").on(leaderboard.gamemode, leaderboard.world),
        userId: uniqueIndex("userId").on(leaderboard.userId),
    }),
)

export type Leaderboard = typeof leaderboard.$inferSelect
export type InsertLeaderboard = typeof leaderboard.$inferInsert
