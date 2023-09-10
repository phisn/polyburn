import { and, eq } from "drizzle-orm"
import { Buffer } from "node:buffer"
import { z } from "zod"
import { replays } from "../db-schema"
import { publicProcedure, router } from "../trpc"

export const replayRouter = router({
    get: publicProcedure
        .input(
            z.object({
                world: z.string(),
                gamemode: z.string(),
            }),
        )
        .query(async ({ input, ctx: { db } }) => {
            const [replay] = await db
                .select()
                .from(replays)
                .where(and(eq(replays.world, input.world), eq(replays.gamemode, input.gamemode)))
                .limit(1)
                .execute()

            if (!replay) {
                return null
            }

            return {
                world: replay.world,
                gamemode: replay.gamemode,
                stats: {
                    deaths: replay.deaths,
                    ticks: replay.ticks,
                },
                model: Buffer.from(replay.model).toString("base64"),
            }
        }),
})
