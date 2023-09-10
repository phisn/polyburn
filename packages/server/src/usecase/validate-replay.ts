import { TRPCError } from "@trpc/server"
import { and, eq } from "drizzle-orm"
import { Buffer } from "node:buffer"
import { ReplayModel } from "runtime/proto/replay"
import { WorldModel } from "runtime/proto/world"
import { validateReplay } from "runtime/src/model/replay/validateReplay"
import { z } from "zod"
import { replays } from "../db-schema"
import { worlds } from "../domain/worlds"
import { publicProcedure } from "../trpc"

export const validateReplayProcedure = publicProcedure
    .input(
        z
            .object({
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

        const [currentReplay] = await db
            .select({
                id: replays.id,
                ticks: replays.ticks,
            })
            .from(replays)
            .where(and(eq(replays.world, input.world), eq(replays.gamemode, input.gamemode)))
            .limit(1)
            .execute()

        if (currentReplay === undefined || stats.ticks < currentReplay.ticks) {
            console.log(`replay is better, existing ${currentReplay?.ticks}, new ${stats.ticks}`)

            const update = {
                deaths: stats.deaths,
                ticks: stats.ticks,

                model: replayBuffer,
            }

            await db
                .insert(replays)
                .values({
                    world: input.world,
                    gamemode: input.gamemode,

                    ...update,
                })
                .onConflictDoUpdate({
                    target: replays.id,
                    set: update,
                })
                .execute()
        } else {
            console.log(`replay is worse, existing ${currentReplay.ticks}, new ${stats.ticks}`)
        }

        return stats
    })
