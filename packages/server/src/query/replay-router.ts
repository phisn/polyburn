import { z } from "zod"
import { replayKeyFrom, replays } from "../domain/replays"
import { publicProcedure, router } from "../trpc"

export const replayRouter = router({
    get: publicProcedure
        .input(
            z.object({
                world: z.string(),
                gamemode: z.string(),
            }),
        )
        .query(opts => {
            return replays[replayKeyFrom(opts.input.world, opts.input.gamemode)]
        }),
})
