import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { GamemodeDTO, WorldDTO } from "shared/src/server/world"
import { z } from "zod"
import { Environment } from "../../env"
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
        const query = c.req.valid("query")

        const resultWorlds = worlds.map(
            (world): WorldDTO => ({
                gamemodes: world.gamemodes.map(
                    (gamemode): GamemodeDTO => ({
                        name: gamemode,
                    }),
                ),
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
