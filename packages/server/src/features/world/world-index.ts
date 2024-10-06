import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { GamemodeDTO, WorldDTO } from "shared/src/server/world"
import { z } from "zod"
import { Environment } from "../../env"
import { worlds } from "./world-model"

export const routeWorld = new Hono<Environment>().get(
    "/world",
    zValidator(
        "query",
        z.object({
            worldnames: z.array(z.string()),
        }),
    ),
    async c => {
        const db = c.get("db")
        const query = c.req.valid("query")
        const user = c.get("db")

        const queryWorlds = worlds.filter(world => query.worldnames.includes(world.id.name))

        let replays

        const resultWorlds = queryWorlds.map(
            (world): WorldDTO => ({
                gamemodes: world.gamemodes.map(
                    (gamemode): GamemodeDTO => ({
                        name: gamemode,
                    }),
                ),
                id: world.id,
                image: "",
                model: world.model,
            }),
        )

        return c.json({
            worlds: resultWorlds,
        })
    },
)
