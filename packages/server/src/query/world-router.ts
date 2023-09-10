import { TRPCError } from "@trpc/server"
import { inArray } from "drizzle-orm"
import { ReplayStats } from "runtime/src/model/replay/ReplayStats"
import { WorldView } from "shared/src/views/WorldView"
import { z } from "zod"
import { replays } from "../db-schema"
import { worlds } from "../domain/worlds"
import { publicProcedure, router } from "../trpc"

export const worldRouter = router({
    get: publicProcedure.input(z.array(z.string())).query(async ({ input, ctx: { db } }) => {
        const requested = worlds.filter(world => input.includes(world.id.name))

        if (requested.length !== input.length) {
            const notFound = input.filter(name => !requested.some(world => world.id.name === name))

            throw new TRPCError({
                code: "NOT_FOUND",
                message: `Worlds not found: ${notFound.join(", ")}`,
            })
        }

        const replaysFound = await db
            .select()
            .from(replays)
            .where(inArray(replays.world, input))
            .execute()

        return requested.map(
            (world): WorldView => ({
                id: world.id,
                model: world.model,
                gamemodes: world.gamemodes.map(gamemode => {
                    const replay = replaysFound.find(
                        replay => replay.world === world.id.name && replay.gamemode === gamemode,
                    )

                    const replayStats: ReplayStats | undefined = replay && {
                        deaths: replay.deaths,
                        ticks: replay.ticks,
                    }

                    return {
                        name: gamemode,
                        replayStats,
                    }
                }),
            }),
        )
    }),
    list: publicProcedure.query(async () => {
        return worlds.map(world => world.id.name)
    }),
})
