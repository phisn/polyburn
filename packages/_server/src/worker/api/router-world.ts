import { TRPCError } from "@trpc/server"
import { and, asc, eq, inArray } from "drizzle-orm"
import { ReplaySummaryDTO } from "shared/src/worker-api/replay"
import { GamemodeDTO, WorldDTO } from "shared/src/worker-api/world"
import { z } from "zod"
import { worlds } from "../domain/worlds"
import { leaderboard } from "../framework/db-schema"
import { publicProcedure, router } from "../framework/trpc"

export const worldRouter = router({
    get: publicProcedure
        .input(
            z.object({
                names: z.array(z.string()),
            }),
        )
        .query(async ({ input, ctx: { db, user } }) => {
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

            let replaysFound = undefined

            if (user) {
                replaysFound = await db
                    .select()
                    .from(leaderboard)
                    .where(
                        and(
                            inArray(leaderboard.world, input.names),
                            eq(leaderboard.userId, user.id),
                        ),
                    )
                    .orderBy(asc(leaderboard.ticks))
                    .execute()

                replaysFound = replaysFound.map(
                    (replay): ReplaySummaryDTO => ({
                        deaths: replay.deaths,
                        rank: replayApplyTo
                        ticks: replay.ticks,
                        username: "username",
                    }),
                )
            }

            return requested.map(
                (world): WorldDTO => ({
                    id: world.id,

                    image: "",
                    model: world.model,
                    gamemodes: world.gamemodes.map(gamemode => {
                        const replay = replaysFound?.find(
                            replay =>
                                replay.world === world.id.name && replay.gamemode === gamemode,
                        )

                        const gamemodeDTO: GamemodeDTO = {
                            name: gamemode,
                            replaySummary: {
                                deaths: replay?.deaths ?? 0,
                            },
                        }

                        return gamemodeDTO
                    }),
                }),
            )
        }),
    list: publicProcedure.query(async () => {
        return worlds.map(world => world.id.name)
    }),
})
