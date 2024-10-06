import { caseValidateReplay } from "../api/case-validate-replay"
import { leaderboardRouter } from "../api/router-replay"
import { userRouter } from "../api/router-user"
import { worldRouter } from "../api/router-world"
import { router } from "./trpc"

export const appRouter = router({
    user: userRouter,
    world: worldRouter,
    replay: leaderboardRouter,
    validateReplay: caseValidateReplay,
})

export type AppRouter = typeof appRouter
