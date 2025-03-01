import * as RAPIER from "@dimforge/rapier2d"
import { zValidator } from "@hono/zod-validator"
import { BSON } from "bson"
import { compress } from "compress-json"
import { and, eq } from "drizzle-orm"
import { ReplayInputModel, ReplayModel } from "game/proto/replay"
import { WorldConfig } from "game/proto/world"
import { Game } from "game/src/game"
import { GameOutput, GameOutputFrame } from "game/src/model/store"
import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { ReplayDTO } from "shared/src/server/replay"
import { gunzipSync, gzipSync } from "zlib"
import { z } from "zod"
import { Environment } from "../../env"
import { users } from "../user/user-model"
import { UserService } from "../user/user-service"
import { worlds } from "../world/world-model"
import { replays, ReplaySummary, replaySummaryColumns, replaySummaryDTO } from "./replay-model"

export const routeReplay = new Hono<Environment>()
    .get(
        "/",
        zValidator(
            "query",
            z.object({
                replayId: z.string(),
            }),
        ),
        async c => {
            const db = c.get("db")
            const query = c.req.valid("query")

            const result = await db
                .select({
                    ...replaySummaryColumns,
                    replayKey: replays.replayKey,
                })
                .from(replays)
                .innerJoin(users, eq(users.id, replays.userId))
                .where(eq(replays.id, query.replayId))
                .groupBy(users.id)

            const [replay] = result

            if (replay === undefined) {
                throw new HTTPException(404)
            }

            const replayDTO: ReplayDTO = {
                ...replaySummaryDTO(replay, c.env.ENV_URL_REPLAYS),
            }

            return c.json(replayDTO)
        },
    )
    .get(
        "/sync",
        zValidator(
            "query",
            z.object({
                timestamp: z.string(),
            }),
        ),
        async c => {},
    )
    .get(
        "/world",
        zValidator(
            "query",
            z.object({
                gamemode: z.string(),
                worldname: z.string(),
            }),
        ),
        async c => {
            const db = c.get("db")
            const query = c.req.valid("query")

            const result: ReplaySummary[] = await db
                .select(replaySummaryColumns)
                .from(replays)
                .innerJoin(users, eq(users.id, replays.userId))
                .where(
                    and(
                        eq(replays.gamemode, query.gamemode),
                        eq(replays.worldname, query.worldname),
                    ),
                )
                .limit(25)

            return c.json({
                replays: result.map(x => replaySummaryDTO(x, c.env.ENV_URL_REPLAYS)),
            })
        },
    )
    .get(
        "/user",
        zValidator(
            "query",
            z.object({
                username: z.string(),
            }),
        ),
        async c => {
            const db = c.get("db")
            const query = c.req.valid("query")

            const result: ReplaySummary[] = await db
                .select({
                    ...replaySummaryColumns,
                })
                .from(replays)
                .innerJoin(users, eq(users.id, replays.userId))
                .where(eq(users.username, query.username))

            return c.json({
                replays: result.map(x => replaySummaryDTO(x, c.env.ENV_URL_REPLAYS)),
            })
        },
    )
    .post(
        "/",
        zValidator(
            "json",
            z.object({
                gamemode: z.string(),
                input: z.string(),
                worldname: z.string(),
            }),
        ),
        async c => {
            const db = c.get("db")
            const json = c.req.valid("json")
            const userService = new UserService(c)
            const user = await userService.getAuthenticated()

            if (user === undefined) {
                throw new HTTPException(401)
            }

            const result = validateReplay(json.gamemode, json.input, json.worldname)

            if (result === undefined) {
                throw new HTTPException(400)
            }

            const inputBuffer = Buffer.from(json.input, "base64")

            const best = (
                await db
                    .select(replaySummaryColumns)
                    .from(replays)
                    .innerJoin(users, eq(users.id, replays.userId))
                    .where(
                        and(
                            eq(replays.userId, user.id),
                            eq(replays.worldname, json.worldname),
                            eq(replays.gamemode, json.gamemode),
                        ),
                    )
                    .orderBy(replays.ticks, replays.deaths)
                    .limit(1)
            ).at(0)

            if (best) {
                const worseTime = best.ticks < result.summary.ticks
                const worseDeaths =
                    best.ticks === result.summary.ticks && best.deaths < result.summary.ticks

                if (worseTime || worseDeaths) {
                    return c.json({
                        type: "no-improvement" as const,

                        bestSummary: replaySummaryDTO(best, c.env.ENV_URL_REPLAYS),
                    })
                }
            }

            const replayBuffer = gzipSync(JSON.stringify(result.replay))

            const customMetadata: Record<string, string> = {
                userId: "" + user.id,
                gamemode: json.gamemode,
                worldname: json.worldname,
            }

            const inputObject = await c.env.R2_INPUTS.put(crypto.randomUUID(), inputBuffer, {
                customMetadata,
            })

            const replayObject = await c.env.R2_REPLAYS.put(crypto.randomUUID(), replayBuffer, {
                customMetadata,
            })

            const update = {
                replayKey: replayObject.key,
                inputKey: inputObject.key,

                deaths: result.summary.deaths,
                gamemode: json.gamemode,
                ticks: result.summary.ticks,
                userId: user.id,
                worldname: json.worldname,
            } satisfies typeof replays.$inferInsert

            const [replayInsert] = await db
                .insert(replays)
                .values({
                    id: best?.id,
                    ...update,
                })
                .onConflictDoUpdate({
                    target: replays.id,
                    set: { ...update },
                })
                .returning({
                    id: replays.id,
                })

            const [replay] = await db
                .select(replaySummaryColumns)
                .from(replays)
                .where(eq(replays.id, replayInsert.id))
                .innerJoin(users, eq(users.id, user.id))

            return c.json({
                type: "improvement" as const,

                replaySummary: replaySummaryDTO(replay, c.env.ENV_URL_REPLAYS),
                bestSummary: best && replaySummaryDTO(best, c.env.ENV_URL_REPLAYS),
            })
        },
    )
    .get(
        "/frames/:replayId",
        zValidator(
            "param",
            z.object({
                replayId: z.string(),
            }),
        ),
        async c => {
            console.log(`"${c.req.valid("param").replayId}"`)

            const replay = await c.env.R2_REPLAYS.get(c.req.valid("param").replayId)
            const replayBuffer = await replay?.arrayBuffer()

            if (replayBuffer === undefined) {
                throw new HTTPException(404)
            }

            console.log("gzip size: ", replayBuffer.byteLength)

            const replayJson = JSON.parse(gunzipSync(replayBuffer).toString("ascii"))

            console.log("raw json size: ", JSON.stringify(replayJson).length)
            console.log("bson size: ", BSON.serialize(replayJson).length)
            console.log("gzip bson size: ", gzipSync(BSON.serialize(replayJson)).length)
            console.log(
                "gzip json compress size: ",
                gzipSync(JSON.stringify(BSON.serialize({ value: compress(replayJson) }))).length,
            )

            return c.json(replayJson as GameOutput)
        },
    )

function validateReplay(gamemode: string, replayModelBase64: string, worldname: string) {
    const world = worlds.find(x => x.worldname === worldname)

    if (world === undefined) {
        return undefined
    }

    try {
        const worldConfig = WorldConfig.decode(
            new Uint8Array(Buffer.from(world.configBase64 ?? "", "base64")),
        )

        const replayInput = ReplayInputModel.decode(
            new Uint8Array(Buffer.from(replayModelBase64, "base64")),
        )

        const game = new Game(
            {
                gamemode: gamemode,
                world: worldConfig,
                worldname,
            },
            {
                rapier: RAPIER,
            },
        )

        const output: GameOutput = {
            version: 1,
            frames: [],
        }

        let outputFrame: GameOutputFrame = {}

        game.store.outputEvents.listenAll({
            onCaptured: event => (outputFrame.onCaptured = event),
            onDeath: event => (outputFrame.onDeath = event),
            onRocketCollision: event => (outputFrame.onRocketCollision = event),
            setCapture: event => (outputFrame.setCapture = event),
            setRocket: event => (outputFrame.setRocket = event),
            setThrust: event => (outputFrame.setThrust = event),
        })

        game.onReset()

        for (const frame of replayInput.frames) {
            game.onUpdate({
                thrust: frame.thrust,
                rotation: frame.rotation,
            })

            output.frames.push(outputFrame)
            outputFrame = {}
        }

        const replay: ReplayModel = ReplayModel.create({
            frames: replayInput.frames.map(x => ({
                rotation: x.rotation,
                thrust: x.thrust,
            })),
        })

        return {
            replay: output,
            summary: game.store.resources.get("summary"),
        }
    } catch (e) {
        console.error(e)
    }

    return undefined
}
