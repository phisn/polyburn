import { blob, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

export const replays = sqliteTable(
    "replays",
    {
        id: integer("id").primaryKey({
            autoIncrement: true,
        }),

        world: text("world").notNull(),
        gamemode: text("gamemode").notNull(),

        deaths: integer("deaths").notNull(),
        ticks: integer("ticks").notNull(),

        model: blob("model", { mode: "buffer" }).notNull(),
    },
    replays => ({
        gamemodeWorld: uniqueIndex("gamemodeWorld").on(replays.gamemode, replays.world),
    }),
)

export type Replay = typeof replays.$inferSelect
export type InsertReplay = typeof replays.$inferInsert
