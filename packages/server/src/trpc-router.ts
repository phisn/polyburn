import { replayRouter } from "./query/replay-router"
import { worldRouter } from "./query/world-router"
import { router } from "./trpc"
import { validateReplayProcedure } from "./usecase/validate-replay"

export const appRouter = router({
    world: worldRouter,
    replay: replayRouter,
    validateReplay: validateReplayProcedure,
})

export type AppRouter = typeof appRouter
