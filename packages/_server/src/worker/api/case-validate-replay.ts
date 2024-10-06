import RAPIER from "@dimforge/rapier2d"
import { TRPCError } from "@trpc/server"
import { and, count, eq, lt, sql } from "drizzle-orm"
import { DrizzleD1Database } from "drizzle-orm/d1"
import { ReplayModel } from "game/proto/replay"
import { WorldConfig } from "game/proto/world"
import { Game } from "game/src/game"
import { replayApplyTo } from "game/src/model/replay"
import { Buffer } from "node:buffer"
import { ReplaySummaryDTO } from "shared/src/worker-api/replay"
import { z } from "zod"
import { worlds } from "../domain/worlds"
import { leaderboard } from "../framework/db-schema"
import { publicProcedure } from "../framework/trpc"

export const caseValidateReplay = publicProcedure
    .input(
        z
            .object({
                worldname: z.string(),
                gamemode: z.string(),
                replayModelBase64: z.string(),
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

        const replayBuffer = Buffer.from(input.replayModelBase64, "base64")
        const summary = serverValidateReplay(input.worldname, input.gamemode, replayBuffer)

        const [[bestReplayEntry], [replayRank]] = await db.batch([
            personalBestQuery(db, user.id, input.worldname, input.gamemode),
            rankForTicksQuery(db, summary.ticks, input.worldname, input.gamemode),
        ])

        let replaySummaryBest: ReplaySummaryDTO = undefined

        if (bestReplayEntry) {
            const rank = await rankForTicks(
                db,
                bestReplayEntry.ticks,
                input.worldname,
                input.gamemode,
            )

            replaySummaryBest = {
                username: user.,
                rank,
                ticks: bestReplayEntry.ticks,
                deaths: bestReplayEntry.deaths,
            }
        }

        if (replaySummaryBest === undefined || summary.ticks <= replaySummaryBest.ticks) {
            const update = {
                userId: user.id,

                deaths: summary.deaths,
                ticks: summary.ticks,

                model: replayBuffer,
            }

            try {
                await db
                    .insert(leaderboard)
                    .values({
                        id: bestReplayEntry?.id,

                        world: input.worldname,
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

                throw new TRPCError({
                    message: "Failed to update leaderboard",
                    code: "INTERNAL_SERVER_ERROR",
                })
            }

            console.log(
                `replay is better, existing ${replaySummaryBest?.ticks}, new ${summary.ticks}`,
            )
        } else {
            console.log(`replay is worse, existing ${bestReplayEntry?.ticks}, new ${summary.ticks}`)
        }

        return {
            replaySummaryBest,
            replaySummary,
        }
    })

function serverValidateReplay(worldname: string, gamemode: string, replayBuffer: Buffer) {
    const worldEntry = worlds.find(world => world.id.name === worldname)

    if (!worldEntry) {
        console.log("world not found: " + worldname)

        throw new TRPCError({
            message: "World not found",
            code: "BAD_REQUEST",
        })
    }

    try {
        const replayModel = ReplayModel.decode(replayBuffer)
        const worldConfig = WorldConfig.decode(Buffer.from(worldEntry.model, "base64"))

        const gameSummary = replayApplyTo(
            new Game(
                {
                    world: worldConfig,
                    gamemode,
                },
                { rapier: RAPIER },
            ),
            replayModel,
        ).resources.get("summary")

        if (!gameSummary) {
            console.log("replay is invalid")

            throw new TRPCError({
                message: "Replay is invalid",
                code: "BAD_REQUEST",
            })
        }

        return gameSummary
    } catch (e) {
        console.log(e)
        throw new TRPCError({
            message: "Replay is invalid",
            code: "BAD_REQUEST",
        })
    }
}

function personalBestQuery(db: DrizzleD1Database, userId: number, world: string, gamemode: string) {
    return db
        .select({
            id: leaderboard.id,
            ticks: leaderboard.ticks,
            deaths: leaderboard.deaths,
        })
        .from(leaderboard)
        .where(
            and(
                eq(leaderboard.userId, userId),
                eq(leaderboard.world, world),
                eq(leaderboard.gamemode, gamemode),
            ),
        )
        .limit(1)
}

function rankForTicksQuery(db: DrizzleD1Database, ticks: number, world: string, gamemode: string) {
    return db
        .select({ count: sql<number>`${count()} + 1` })
        .from(leaderboard)
        .where(
            and(
                eq(leaderboard.world, world),
                eq(leaderboard.gamemode, gamemode),
                lt(leaderboard.ticks, ticks),
            ),
        )
}

async function rankForTicks(db: DrizzleD1Database, ticks: number, world: string, gamemode: string) {
    const [result] = await rankForTicksQuery(db, ticks, world, gamemode).execute()

    if (result === undefined) {
        console.error("Failed to get rank")
        throw new Error("Failed to get rank")
    }

    return result.count
}
