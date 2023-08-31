import { z } from "zod"
import { replayKeyFrom, replays } from "../domain/replays"
import { publicProcedure, router } from "../trpc"

export const replayRouter = router({
    get: publicProcedure
        .input(
            z.object({
                map: z.string(),
                gamemode: z.string(),
            }),
        )
        .query(opts => {
            return replays[replayKeyFrom(opts.input.map, opts.input.gamemode)]
        }),
})
