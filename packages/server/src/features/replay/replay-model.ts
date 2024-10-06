import { blob, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { ReplaySummaryDTO } from "shared/src/server/replay"

export const replays = sqliteTable(
    "replays",
    {
        id: integer("id").primaryKey({
            autoIncrement: true,
        }),

        deaths: integer("deaths").notNull(),
        gamemode: text("gamemode").notNull(),
        model: blob("model", { mode: "buffer" }).notNull(),
        ticks: integer("ticks").notNull(),
        worldname: text("world").notNull(),

        userId: integer("userId").notNull(),
    },
    leaderboard => ({
        gamemodeWorld: index("gamemodeWorld").on(leaderboard.gamemode, leaderboard.worldname),
        userId: index("userId").on(leaderboard.userId),
    }),
)

export type Replay = typeof replays.$inferSelect & {
    rank: number
    username: string
}

export function replaySummaryDTO(replay: Replay): ReplaySummaryDTO {
    return {
        id: replay.id,
        deaths: replay.deaths,
        rank: replay.rank,
        ticks: replay.ticks,
        username: replay.username,
    }
}
