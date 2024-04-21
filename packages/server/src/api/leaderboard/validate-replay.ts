import { TRPCError } from "@trpc/server"
import { and, count, eq, lt } from "drizzle-orm"
import { DrizzleD1Database } from "drizzle-orm/d1"
import { Buffer } from "node:buffer"
import { ReplayModel } from "runtime/proto/replay"
import { WorldModel } from "runtime/proto/world"
import { validateReplay } from "runtime/src/model/replay/validate-replay"
import { z } from "zod"
import { worlds } from "../../domain/worlds"
import { leaderboard } from "../../framework/db-schema"
import { publicProcedure } from "../../framework/trpc"

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
    .mutation(async ({ input, ctx: { db, user } }) => {
        if (!user) {
            console.log("user not found")

            throw new TRPCError({
                message: "User not found",
                code: "BAD_REQUEST",
            })
        }

        const replayBuffer = Buffer.from(input.replay, "base64")
        const stats = serverValidateReplay(input.world, input.gamemode, replayBuffer)

        const [[personalBest], [rank]] = await db.batch([
            db
                .select({
                    id: leaderboard.id,
                    ticks: leaderboard.ticks,
                })
                .from(leaderboard)
                .where(
                    and(
                        eq(leaderboard.world, input.world),
                        eq(leaderboard.gamemode, input.gamemode),
                        eq(leaderboard.userId, user.id),
                    ),
                )
                .limit(1),
            db
                .select({ count: count() })
                .from(leaderboard)
                .where(
                    and(
                        eq(leaderboard.world, input.world),
                        eq(leaderboard.gamemode, input.gamemode),
                        lt(leaderboard.ticks, stats.ticks),
                    ),
                ),
        ])

        let personalBestRank = undefined

        if (personalBest) {
            personalBestRank = await rankForTicks(
                db,
                personalBest.ticks,
                input.world,
                input.gamemode,
            )
        }

        if (personalBest === undefined || stats.ticks < personalBest.ticks) {
            const update = {
                userId: user.id,

                deaths: stats.deaths,
                ticks: stats.ticks,

                model: replayBuffer,
            }

            try {
                await db
                    .insert(leaderboard)
                    .values({
                        id: personalBest?.id,

                        world: input.world,
                        gamemode: input.gamemode,

                        ...update,
                    })
                    .onConflictDoUpdate({
                        target: leaderboard.id,
                        set: update,
                    })
                    .execute()

                return {
                    rank: rank?.count,
                    personalBestRank,
                }
            } catch (e) {
                console.log(e)

                throw new TRPCError({
                    message: "Failed to update leaderboard",
                    code: "INTERNAL_SERVER_ERROR",
                })
            }
        } else {
            console.log(`replay is worse, existing ${personalBest.ticks}, new ${stats.ticks}`)

            return {
                personalBestRank,
            }
        }
    })

function serverValidateReplay(worldname: string, gamemode: string, replayBuffer: Buffer) {
    const world = worlds.find(world => world.id.name === worldname)

    if (!world) {
        console.log("world not found: " + worldname)

        throw new TRPCError({
            message: "World not found",
            code: "BAD_REQUEST",
        })
    }

    try {
        const replayModel = ReplayModel.decode(replayBuffer)
        const worldModel = WorldModel.decode(Buffer.from(world.model, "base64"))

        const stats = validateReplay(replayModel, worldModel, gamemode)

        if (!stats) {
            console.log("replay is invalid")

            throw new TRPCError({
                message: "Replay is invalid",
                code: "BAD_REQUEST",
            })
        }

        return stats
    } catch (e) {
        console.log(e)
        throw new TRPCError({
            message: "Replay is invalid",
            code: "BAD_REQUEST",
        })
    }
}

async function rankForTicks(db: DrizzleD1Database, ticks: number, world: string, gamemode: string) {
    const result = await db
        .select({ count: count() })
        .from(leaderboard)
        .where(
            and(
                eq(leaderboard.world, world),
                eq(leaderboard.gamemode, gamemode),
                lt(leaderboard.ticks, ticks),
            ),
        )
        .execute()

    return result.at(0)?.count
}
