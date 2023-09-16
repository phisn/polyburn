import { TRPCError } from "@trpc/server"
import { asc, eq, inArray } from "drizzle-orm"
import { WorldView } from "shared/src/views/WorldView"
import { z } from "zod"
import { leaderboard } from "../db-schema"
import { worlds } from "../domain/worlds"
import { publicProcedure, router } from "../trpc"

export const worldRouter = router({
    get: publicProcedure
        .input(
            z.object({
                names: z.array(z.string()),
                userId: z.string(),
            }),
        )
        .query(async ({ input, ctx: { db } }) => {
            const requested = worlds.filter(world => input.names.includes(world.id.name))

            if (requested.length !== input.names.length) {
                const notFound = input.names.filter(
                    name => !requested.some(world => world.id.name === name),
                )

                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `Worlds not found: ${notFound.join(", ")}`,
                })
            }

            const replaysFound = await db
                .select()
                .from(leaderboard)
                .where(inArray(leaderboard.world, input.names))
                .where(eq(leaderboard.userId, input.userId))
                .orderBy(asc(leaderboard.ticks))
                .execute()

            return requested.map(
                (world): WorldView => ({
                    id: world.id,
                    model: world.model,
                    gamemodes: world.gamemodes.map(gamemode => {
                        const replay = replaysFound.find(
                            replay =>
                                replay.world === world.id.name && replay.gamemode === gamemode,
                        )

                        return {
                            name: gamemode,
                            replayStats: replay && {
                                deaths: replay.deaths,
                                ticks: replay.ticks,
                            },
                        }
                    }),
                }),
            )
        }),
    list: publicProcedure.query(async () => {
        return worlds.map(world => world.id.name)
    }),
})
