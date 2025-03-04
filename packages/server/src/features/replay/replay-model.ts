import { sql } from "drizzle-orm"
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { randomUUID } from "node:crypto"
import { ReplaySummaryDTO } from "shared/src/server/replay"
import { users } from "../user/user-model"

export const replays = sqliteTable(
    "replays",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => randomUUID()),

        timestamp: integer("timestamp", { mode: "timestamp" }).$defaultFn(() => new Date()),

        replayKey: text("replayKey").notNull(),
        inputKey: text("inputKey").notNull(),

        deaths: integer("deaths").notNull(),
        gamemode: text("gamemode").notNull(),
        ticks: integer("ticks").notNull(),
        worldname: text("worldname").notNull(),

        userId: integer("userId").notNull(),
    },
    leaderboard => ({
        gamemodeWorld: index("gamemodeWorld").on(leaderboard.gamemode, leaderboard.worldname),
        userId: index("userId").on(leaderboard.userId),
    }),
)

export interface ReplaySummary {
    id: string

    replayKey: string

    deaths: number
    gamemode: string
    rank: number
    ticks: number
    username: string
    worldname: string
}

export const replayRank = sql<number>`
    ROW_NUMBER() OVER (
        PARTITION BY ${replays.worldname.name}, ${replays.gamemode.name} 
        ORDER BY ${replays.ticks} ASC
    )`

export const replaySummaryColumns = {
    id: replays.id,
    replayKey: replays.replayKey,
    deaths: replays.deaths,
    gamemode: replays.gamemode,
    rank: replayRank,
    ticks: replays.ticks,
    username: users.username,
    worldname: replays.worldname,
}

export function replaySummaryDTO(replay: ReplaySummary, replayUrl: string): ReplaySummaryDTO {
    return {
        id: replay.id,
        replayUrl: `${replayUrl}/${replay.replayKey}`,
        deaths: replay.deaths,
        gamemode: replay.gamemode,
        rank: replay.rank,
        ticks: replay.ticks,
        username: replay.username,
        worldname: replay.worldname,
    }
}
