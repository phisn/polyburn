import { leaderboardRouter } from "../api/leaderboard/leaderboard-router"
import { validateReplayProcedure } from "../api/leaderboard/validate-replay"
import { userRouter } from "../api/user/user-router"
import { worldRouter } from "../api/world/world-router"
import { router } from "./trpc"

export const appRouter = router({
    user: userRouter,
    world: worldRouter,
    replay: leaderboardRouter,
    validateReplay: validateReplayProcedure,
})

export type AppRouter = typeof appRouter
