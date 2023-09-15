import { and, eq } from "drizzle-orm"
import { Buffer } from "node:buffer"
import { z } from "zod"
import { leaderboard } from "../db-schema"
import { publicProcedure, router } from "../trpc"

export const leaderboardRouter = router({
    get: publicProcedure
        .input(
            z.object({
                userId: z.string(),
                world: z.string(),
                gamemode: z.string(),
            }),
        )
        .query(async ({ input, ctx: { db } }) => {
            const [replay] = await db
                .select()
                .from(leaderboard)
                .where(
                    and(
                        eq(leaderboard.userId, input.userId),
                        eq(leaderboard.world, input.world),
                        eq(leaderboard.gamemode, input.gamemode),
                    ),
                )
                .limit(1)
                .execute()

            if (!replay) {
                return null
            }

            return {
                leaderboardId: replay.id,
                deaths: replay.deaths,
                ticks: replay.ticks,
                model: Buffer.from(replay.model).toString("base64"),
            }
        }),
    list: publicProcedure
        .input(
            z.object({
                world: z.string(),
                gamemode: z.string(),
            }),
        )
        .query(async ({ input, ctx: { db } }) => {
            const replays = await db
                .select()
                .from(leaderboard)
                .where(
                    and(
                        eq(leaderboard.world, input.world),
                        eq(leaderboard.gamemode, input.gamemode),
                    ),
                )
                .orderBy(leaderboard.ticks)
                .limit(10)
                .execute()

            return replays.map(replay => ({
                leaderboardId: replay.id,
                userId: replay.userId,
                deaths: replay.deaths,
                ticks: replay.ticks,
                model: Buffer.from(replay.model).toString("base64"),
            }))
        }),
})
