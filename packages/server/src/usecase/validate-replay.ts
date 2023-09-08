import { ReplayModel } from "runtime/proto/replay"
import { WorldModel } from "runtime/proto/world"
import { base64ToBytes } from "runtime/src/model/base64ToBytes"
import { validateReplay } from "runtime/src/model/replay/validateReplay"
import { z } from "zod"
import { replayKeyFrom, replays } from "../domain/replays"
import { worlds } from "../domain/worlds"
import { prisma } from "../prisma"
import { publicProcedure } from "../trpc"

export const validateReplayProcedure = publicProcedure
    .input(
        z
            .object({
                world: z.string(),
                gamemode: z.string(),
                replay: z.string(),
            })
            .required(),
    )
    .mutation(async opts => {
        const world = worlds.find(world => world.id.name === opts.input.world)

        if (!world) {
            console.log("world not found: " + opts.input.world)
            throw new Error(`World not found: ${opts.input.world}`)
        }

        const replayBuffer = base64ToBytes(opts.input.replay)

        const replayModel = ReplayModel.decode(replayBuffer)
        const worldModel = WorldModel.decode(base64ToBytes(world.model))

        const stats = validateReplay(replayModel, worldModel, opts.input.gamemode)

        if (!stats) {
            console.log("replay is invalid")
            throw new Error("Replay is invalid")
        }

        const replayKey = replayKeyFrom(opts.input.world, opts.input.gamemode)
        const currentReplay = replays[replayKey]

        console.log("ticks in" + stats.ticks + " < " + currentReplay?.stats.ticks)

        if (currentReplay === undefined || stats.ticks < currentReplay.stats.ticks) {
            replays[replayKey] = {
                world: opts.input.world,
                gamemode: opts.input.gamemode,
                stats,
                model: opts.input.replay,
            }

            prisma.replay.upsert({
                where: {
                    world_gamemode: {
                        world: opts.input.world,
                        gamemode: opts.input.gamemode,
                    },
                },
                create: {
                    world: opts.input.world,
                    gamemode: opts.input.gamemode,

                    deaths: stats.deaths,
                    ticks: stats.ticks,
                    model: replayBuffer,
                },
                update: {
                    deaths: stats.deaths,
                    ticks: stats.ticks,
                    model: replayBuffer,
                },
            })

            console.log("result: " + JSON.stringify(replays[replayKey]))
        }

        return stats
    })
