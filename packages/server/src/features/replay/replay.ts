import { zValidator } from "@hono/zod-validator"
import { and, eq } from "drizzle-orm"
import { Hono } from "hono"
import { z } from "zod"
import { Environment } from "../../env"
import { users } from "../user/user-model"
import { UserService } from "../user/user-service"
import { Replay, replaySummaryDTO, replays } from "./replay-model"
import { ReplayService } from "./replay-service"

export const routeReplay = new Hono<Environment>()
    .get(
        "/:worldname/:gamemode",
        zValidator(
            "query",
            z.object({
                worldname: z.string(),
                gamemode: z.string(),
            }),
        ),
        async c => {
            const query = c.req.valid("query")
            const replayService = new ReplayService(c)

            const result: Replay[] = await replayService.replays
                .where(
                    and(
                        eq(replays.worldname, query.worldname),
                        eq(replays.gamemode, query.gamemode),
                    ),
                )
                .limit(50)

            return c.json({
                replays: result.map(replaySummaryDTO),
            })
        },
    )
    .get("/me", async c => {
        const userService = new UserService(c)
        const user = await userService.getAuthenticated()

        if (user === undefined) {
            return c.status(401)
        }

        const replayService = new ReplayService(c)
        const result: Replay[] = await replayService.replays.where(eq(users.id, user.id)).limit(50)

        return c.json({
            replays: result.map(replaySummaryDTO),
        })
    })
