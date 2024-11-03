import * as RAPIER from "@dimforge/rapier2d"
import { zValidator } from "@hono/zod-validator"
import { eq } from "drizzle-orm"
import { ReplayModel } from "game/proto/replay"
import { WorldConfig } from "game/proto/world"
import { Game } from "game/src/game"
import { applyReplay } from "game/src/model/replay"
import { rocketComponents } from "game/src/modules/module-rocket"
import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { ReplayDTO, ReplayFrameDTO } from "shared/src/server/replay"
import { z } from "zod"
import { Environment } from "../../env"
import { users } from "../user/user-model"
import { UserService } from "../user/user-service"
import { worlds } from "../world/world-model"
import {
    ReplaySummary,
    decodeReplayFrames,
    encodeReplayFrames,
    replaySummaryColumns,
    replaySummaryDTO,
    replays,
} from "./replay-model"

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
                    frames: replays.binaryFrames,
                })
                .from(replays)
                .innerJoin(users, eq(users.id, replays.userId))
                .where(eq(replays.id, query.replayId))

            const [replay] = result

            if (replay === undefined) {
                throw new HTTPException(404)
            }

            const replayDTO: ReplayDTO = {
                ...replaySummaryDTO(replay),
                frames: decodeReplayFrames(replay.frames),
            }

            return c.json(replayDTO)
        },
    )
    .get(
        "/world",
        zValidator(
            "query",
            z.object({
                worldname: z.string(),
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
                .where(eq(replays.worldname, query.worldname))
                .limit(25)

            return c.json({
                replays: result.map(replaySummaryDTO),
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
                replays: result.map(replaySummaryDTO),
            })
        },
    )
    .post(
        "/",
        zValidator(
            "json",
            z.object({
                gamemode: z.string(),
                model: z.string(),
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

            const result = validateReplay(json.gamemode, json.model, json.worldname)

            if (result === undefined) {
                throw new HTTPException(400)
            }

            const [replayInsert] = await db
                .insert(replays)
                .values({
                    binaryFrames: encodeReplayFrames(result.replayFrames),
                    binaryModel: Buffer.from(json.model, "base64"),
                    deaths: result.summary.deaths,
                    gamemode: json.gamemode,
                    ticks: result.summary.ticks,
                    userId: user.id,
                    worldname: json.worldname,
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
                replaySummary: replaySummaryDTO(replay),
            })
        },
    )

function validateReplay(gamemode: string, replayModelBase64: string, worldname: string) {
    const world = worlds.find(x => x.id.name === worldname)

    if (world === undefined) {
        return undefined
    }

    try {
        const worldConfig = WorldConfig.decode(Buffer.from(world.configBase64, "base64"))

        const game = new Game(
            {
                world: worldConfig,
                gamemode: gamemode,
            },
            {
                rapier: RAPIER,
            },
        )

        const replayModel = ReplayModel.decode(Buffer.from(replayModelBase64, "base64"))
        const replayFrames: ReplayFrameDTO[] = []

        const getRocket = game.store.entities.single(...rocketComponents)

        applyReplay(replayModel, input => {
            const rocket = getRocket()

            replayFrames.push({
                position: rocket.get("body").translation(),
                rotation: rocket.get("body").rotation(),
                thurst: input.thrust,
            })

            game.onUpdate(input)
        })

        return {
            replayFrames,
            summary: game.store.resources.get("summary"),
        }
    } catch (e) {
        console.error(e)
    }

    return undefined
}

/*

export const caseValidateReplay = publicProcedure
    .input(
        z
            .object({
                worldname: z.string(),
                gamemode: z.string(),
                replayModelBase64: z.string(),
            })
            .required(),
    )
    .mutation(async ({ input, ctx: { db, user } }) => {
        if (!user) {
            console.log("user not found")

            throw new TRPCError({
                message: "User not found",
                code: "BAD_REQUEST",
            })
        }

        const replayBuffer = Buffer.from(input.replayModelBase64, "base64")
        const summary = serverValidateReplay(input.worldname, input.gamemode, replayBuffer)

        const [[bestReplayEntry], [replayRank]] = await db.batch([
            personalBestQuery(db, user.id, input.worldname, input.gamemode),
            rankForTicksQuery(db, summary.ticks, input.worldname, input.gamemode),
        ])

        let replaySummaryBest: ReplaySummaryDTO = undefined

        if (bestReplayEntry) {
            const rank = await rankForTicks(
                db,
                bestReplayEntry.ticks,
                input.worldname,
                input.gamemode,
            )

            replaySummaryBest = {
                username: user.,
                rank,
                ticks: bestReplayEntry.ticks,
                deaths: bestReplayEntry.deaths,
            }
        }

        if (replaySummaryBest === undefined || summary.ticks <= replaySummaryBest.ticks) {
            const update = {
                userId: user.id,

                deaths: summary.deaths,
                ticks: summary.ticks,

                model: replayBuffer,
            }

            try {
                await db
                    .insert(leaderboard)
                    .values({
                        id: bestReplayEntry?.id,

                        world: input.worldname,
                        gamemode: input.gamemode,

                        ...update,
                    })
                    .onConflictDoUpdate({
                        target: leaderboard.id,
                        set: update,
                    })
                    .execute()
            } catch (e) {
                console.log(e)

                throw new TRPCError({
                    message: "Failed to update leaderboard",
                    code: "INTERNAL_SERVER_ERROR",
                })
            }

            console.log(
                `replay is better, existing ${replaySummaryBest?.ticks}, new ${summary.ticks}`,
            )
        } else {
            console.log(`replay is worse, existing ${bestReplayEntry?.ticks}, new ${summary.ticks}`)
        }

        return {
            replaySummaryBest,
            replaySummary,
        }
    })

function serverValidateReplay(worldname: string, gamemode: string, replayBuffer: Buffer) {
    const worldEntry = worlds.find(world => world.id.name === worldname)

    if (!worldEntry) {
        console.log("world not found: " + worldname)

        throw new TRPCError({
            message: "World not found",
            code: "BAD_REQUEST",
        })
    }

    try {
        const replayModel = ReplayModel.decode(replayBuffer)
        const worldConfig = WorldConfig.decode(Buffer.from(worldEntry.model, "base64"))

        const gameSummary = replayApplyTo(
            new Game(
                {
                    world: worldConfig,
                    gamemode,
                },
                { rapier: RAPIER },
            ),
            replayModel,
        ).resources.get("summary")

        if (!gameSummary) {
            console.log("replay is invalid")

            throw new TRPCError({
                message: "Replay is invalid",
                code: "BAD_REQUEST",
            })
        }

        return gameSummary
    } catch (e) {
        console.log(e)
        throw new TRPCError({
            message: "Replay is invalid",
            code: "BAD_REQUEST",
        })
    }
}

function personalBestQuery(db: DrizzleD1Database, userId: number, world: string, gamemode: string) {
    return db
        .select({
            id: leaderboard.id,
            ticks: leaderboard.ticks,
            deaths: leaderboard.deaths,
        })
        .from(leaderboard)
        .where(
            and(
                eq(leaderboard.userId, userId),
                eq(leaderboard.world, world),
                eq(leaderboard.gamemode, gamemode),
            ),
        )
        .limit(1)
}

function rankForTicksQuery(db: DrizzleD1Database, ticks: number, world: string, gamemode: string) {
    return db
        .select({ count: sql<number>`${count()} + 1` })
        .from(leaderboard)
        .where(
            and(
                eq(leaderboard.world, world),
                eq(leaderboard.gamemode, gamemode),
                lt(leaderboard.ticks, ticks),
            ),
        )
}

async function rankForTicks(db: DrizzleD1Database, ticks: number, world: string, gamemode: string) {
    const [result] = await rankForTicksQuery(db, ticks, world, gamemode).execute()

    if (result === undefined) {
        console.error("Failed to get rank")
        throw new Error("Failed to get rank")
    }

    return result.count
}

*/
