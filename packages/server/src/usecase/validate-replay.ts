import { TRPCError } from "@trpc/server"
import { and, eq } from "drizzle-orm"
import { Buffer } from "node:buffer"
import { ReplayModel } from "runtime/proto/replay"
import { WorldModel } from "runtime/proto/world"
import { validateReplay } from "runtime/src/model/replay/validateReplay"
import { z } from "zod"
import { leaderboard } from "../db-schema"
import { worlds } from "../domain/worlds"
import { publicProcedure } from "../trpc"

export const validateReplayProcedure = publicProcedure
    .input(
        z
            .object({
                userId: z.string(),
                world: z.string(),
                gamemode: z.string(),
                replay: z.string(),
            })
            .required(),
    )
    .mutation(async ({ input, ctx: { db } }) => {
        const world = worlds.find(world => world.id.name === input.world)

        if (!world) {
            console.log("world not found: " + input.world)

            throw new TRPCError({
                message: "World not found",
                code: "BAD_REQUEST",
            })
        }

        const replayBuffer = Buffer.from(input.replay, "base64")

        const replayModel = ReplayModel.decode(replayBuffer)
        const worldModel = WorldModel.decode(Buffer.from(world.model, "base64"))

        const stats = validateReplay(replayModel, worldModel, input.gamemode)

        if (!stats) {
            console.log("replay is invalid")

            throw new TRPCError({
                message: "Replay is invalid",
                code: "BAD_REQUEST",
            })
        }

        const [currentRecord] = await db
            .select({
                id: leaderboard.id,
                ticks: leaderboard.ticks,
            })
            .from(leaderboard)
            .where(
                and(
                    eq(leaderboard.world, input.world),
                    eq(leaderboard.gamemode, input.gamemode),
                    eq(leaderboard.userId, input.userId),
                ),
            )
            .limit(1)
            .execute()

        if (currentRecord === undefined || stats.ticks < currentRecord.ticks) {
            console.log(`replay is better, existing ${currentRecord?.ticks}, new ${stats.ticks}`)

            const update = {
                userId: input.userId,

                deaths: stats.deaths,
                ticks: stats.ticks,

                model: replayBuffer,
            }

            try {
                await db
                    .insert(leaderboard)
                    .values({
                        id: currentRecord?.id,

                        world: input.world,
                        gamemode: input.gamemode,

                        ...update,
                    })
                    .onConflictDoUpdate({
                        target: leaderboard.id,
                        set: update,
                    })
                    .execute()
            } catch (e) {
                console.log(e)
            }
        } else {
            console.log(`replay is worse, existing ${currentRecord.ticks}, new ${stats.ticks}`)
        }

        return stats
    })
