import { zValidator } from "@hono/zod-validator"
import { eq } from "drizzle-orm"
import { Hono } from "hono"
import { GamemodeDTO, WorldDTO } from "shared/src/server/world"
import { z } from "zod"
import { Environment } from "../../env"
import {
    ReplaySummary,
    replaySummaryColumns,
    replaySummaryDTO,
    replays,
} from "../replay/replay-model"
import { users } from "../user/user-model"
import { worlds } from "./world-model"

export const routeWorld = new Hono<Environment>().get(
    "/",
    zValidator(
        "query",
        z.object({
            timestamp: z.number().optional(),
        }),
    ),
    async c => {
        const db = c.get("db")
        const query = c.req.valid("query")
        const userId = c.get("userId")

        const recordMap = new Map<string, ReplaySummary>()

        if (userId) {
            const records = await db
                .select(replaySummaryColumns)
                .from(replays)
                .innerJoin(users, eq(users.id, replays.userId))
                .where(eq(users.id, userId))

            for (const record of records) {
                recordMap.set(`${record.worldname},${record.gamemode}`, record)
            }
        }

        const resultWorlds = worlds.map(
            (world): WorldDTO => ({
                gamemodes: world.gamemodes.map((gamemode): GamemodeDTO => {
                    const replay = recordMap.get(`${world.worldname},${gamemode}`)

                    return {
                        name: gamemode,
                        replaySummary: replay && replaySummaryDTO(replay),
                    }
                }),
                image: "",
                model: world.configBase64,
                worldname: world.worldname,
            }),
        )

        return c.json({
            worlds: resultWorlds,
        })
    },
)
