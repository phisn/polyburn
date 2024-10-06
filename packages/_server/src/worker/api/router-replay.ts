import { TRPCError } from "@trpc/server"
import { and, eq } from "drizzle-orm"
import { Buffer } from "node:buffer"
import { WorldLeaderboard } from "shared/src/worker-api/world-leaderboard"
import { z } from "zod"
import { leaderboard, users } from "../framework/db-schema"
import { publicProcedure, router } from "../framework/trpc"

export const leaderboardRouter = router({
    get: publicProcedure
        .input(
            z.object({
                username: z.string(),
                world: z.string(),
                gamemode: z.string(),
            }),
        )
        .query(async ({ input, ctx: { db } }) => {
            const [user] = await db
                .select({ id: users.id })
                .from(users)
                .where(eq(users.username, input.username))
                .limit(1)

            if (!user) {
                throw new TRPCError({
                    message: "User not found",
                    code: "BAD_REQUEST",
                })
            }

            const [replay] = await db
                .select()
                .from(leaderboard)
                .where(
                    and(
                        eq(leaderboard.userId, user.id),
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
                .select({
                    leaderboard: {
                        id: leaderboard.id,
                        deaths: leaderboard.deaths,
                        ticks: leaderboard.ticks,
                        model: leaderboard.model,
                    },
                    users: {
                        username: users.username,
                    },
                })
                .from(leaderboard)
                .innerJoin(users, eq(users.id, leaderboard.userId))
                .where(
                    and(
                        eq(leaderboard.world, input.world),
                        eq(leaderboard.gamemode, input.gamemode),
                    ),
                )
                .orderBy(leaderboard.ticks)
                .limit(50)
                .execute()

            const response: WorldLeaderboard = {
                entries: replays.map((replay, i) => ({
                    leaderboardId: replay.leaderboard.id,
                    place: i + 1,
                    deaths: replay.leaderboard.deaths,
                    ticks: replay.leaderboard.ticks,
                    username: replay.users.username,
                })),
            }

            return response
        }),
})
