import { TRPCError } from "@trpc/server"
import { WorldView } from "shared/src/views/WorldView"
import { z } from "zod"
import { replayKeyFrom, replays } from "../domain/replays"
import { worlds } from "../domain/worlds"
import { publicProcedure, router } from "../trpc"

export const worldRouter = router({
    get: publicProcedure.input(z.array(z.string())).query(opts => {
        const requested = worlds.filter(world => opts.input.includes(world.id.name))

        if (requested.length !== opts.input.length) {
            const notFound = opts.input.filter(
                name => !requested.some(world => world.id.name === name),
            )

            throw new TRPCError({
                code: "NOT_FOUND",
                message: `Worlds not found: ${notFound.join(", ")}`,
            })
        }

        return requested.map(
            (world): WorldView => ({
                id: world.id,
                model: world.model,
                gamemodes: world.gamemodes.map(gamemode => ({
                    name: gamemode,
                    replayStats: replays[replayKeyFrom(world.id.name, gamemode)]?.stats,
                })),
            }),
        )
    }),
    list: publicProcedure.query(() => {
        return worlds.map(world => world.id.name)
    }),
})
